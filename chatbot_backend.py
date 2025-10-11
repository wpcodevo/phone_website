import os
from dotenv import load_dotenv
from langchain_google_genai import GoogleGenerativeAI
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_chroma import Chroma
from langchain.chains import create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain.chains import create_history_aware_retriever
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.runnables.history import RunnableWithMessageHistory


load_dotenv()

# Allow either GEMINI_API_KEY or GOOGLE_API_KEY from env/.env
gemini_api_key = os.environ.get("GEMINI_API_KEY") or os.environ.get("GOOGLE_API_KEY")

CHATBOT_READY = bool(gemini_api_key)

if CHATBOT_READY:
    # Propagate to expected env var for the client lib
    os.environ["GOOGLE_API_KEY"] = gemini_api_key

    LLModel = GoogleGenerativeAI(model="gemini-2.5-flash")
    embedding_model = GoogleGenerativeAIEmbeddings(model="gemini-embedding-001")
    vectorstore = Chroma(persist_directory="chroma_db", embedding_function=embedding_model)
    retriever = vectorstore.as_retriever(
        search_type="similarity",
        #search_kwargs={"k": 4}
    )
else:
    # Placeholders to avoid NameError if imported when not configured
    LLModel = None
    embedding_model = None
    vectorstore = None
    retriever = None

system_prompt = """
You are a helpful, customer-friendly mobile phone shop agent.
Use the provided context to answer customer questions about our phones.

**Behavior Rules:**
1.  **Answer from Context:** Only use the information in the `{context}` to answer questions about price, specs, and stock. If the information isn't there, you MUST reply with this exact sentence: `For more details about specific models, please contact us at Phone: 456-456-4512 or Email: company@gmail.com`
2.  **Compare Phones:** If the customer's request matches multiple phones, list them with a brief comparison of key specs and price.
3.  **Recall Details:** If asked for details about a phone mentioned earlier in the conversation, provide only those details without extra chatter.
4.  **Handle Ambiguity:** If a request is unclear (e.g., "the Samsung phone"), ask for clarification (e.g., "Do you mean the Galaxy A54 or the Galaxy S23?").
5.  **Tone:** Be friendly, professional, and concise. Use short paragraphs and bullet points.

**Purchase Flow:**
- If the customer wants to buy a phone, first confirm which model they want.
- Then, collect the following required information: `full name`, `nic` (national identity card number), and `delivery address`.
- Once you have all three pieces of information, you MUST output a JSON object in the format specified below, and NOTHING ELSE.

**JSON Checkout Format:**
```json
{{
  "action": "checkout",
  "customer": {{
    "name": "Full Name",
    "nic": "NIC_NUMBER",
    "address": "Full delivery address",
    "phone": "optional phone number if provided"
  }},
  "items": [
    {{
      "model": "Phone Model Name",
      "sku": "SKU or ID from context",
      "qty": 1,
      "unit_price": 299.99
    }}
  ],
  "subtotal": 299.99,
  "tax": 0.00,
  "shipping": 0.00,
  "total": 299.99,
  "note": "Any note from buyer",
  "next_step": "show_checkout_url_or_invoke_payment_api"
}}
```

Here is the information about our available phones:
{context}
"""

prompt = ChatPromptTemplate.from_messages([
    ("system", system_prompt),
    ("human", "{input}")
])

QAchain = create_stuff_documents_chain(LLModel, prompt) if CHATBOT_READY else None

# This was the old RAGChain, which was not history-aware.
# RAGChain = create_retrieval_chain(retriever, QAchain)

context_system_prompt = (
    "Given a chat history and the latest user question "
    "which might reference context in the chat history, "
    "formulate a standalone question which can be understood without the chat history. "
    "Do NOT answer the question, just reformulate it if needed and otherwise return it as is."
)

context_prompt = ChatPromptTemplate.from_messages([
    ("system", context_system_prompt),
    MessagesPlaceholder("chat_history"),
    ("human", "{input}"),
])

history_aware_retriever = (
    create_history_aware_retriever(LLModel, retriever, context_prompt)
    if CHATBOT_READY else None
)

# Create the new conversational RAG chain
conversational_rag_chain = (
    create_retrieval_chain(history_aware_retriever, QAchain)
    if CHATBOT_READY else None
)


store = {}


def get_session_history(session_id: str) -> BaseChatMessageHistory:
    if session_id not in store:
        store[session_id] = ChatMessageHistory()
    return store[session_id]


ConvRAGChain = (
    RunnableWithMessageHistory(
        conversational_rag_chain,
        get_session_history,
        input_messages_key="input",
        history_messages_key="chat_history",
        output_messages_key="answer",
    ) if CHATBOT_READY else None
)


def get_chatbot_response(message, session_id="default"):
    if not CHATBOT_READY:
        return (
            "Chatbot is not configured. Please set GEMINI_API_KEY (or GOOGLE_API_KEY) in your .env file "
            "and restart the server."
        )
    try:
        response = ConvRAGChain.invoke(
            {"input": message},
            config={"configurable": {"session_id": session_id}},
        )
        return response["answer"]
    except Exception as e:
        print(f"Error in chatbot response: {e}")
        return "Sorry, I encountered an error processing your request. Please try again."
