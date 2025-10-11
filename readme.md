# Responsive Ecommerce Website 📱🛒

A modern, mobile-friendly ecommerce template built with **Flask** (Python), **MongoDB**, and a static frontend (HTML, CSS, JS). Features product catalog, user authentication, admin dashboard, shopping cart, and an advanced **AI-powered chatbot** for product support via Retrieval-Augmented Generation (RAG).

---

## Features

- **Product Catalog**: Browse phones with images, specs, and pricing
- **User Auth**: Registration, login, logout, and password reset (email or console)
- **Admin Dashboard**: Product CRUD UI and APIs (admin only)
- **Shopping Cart**: Add/update/remove/clear cart (session or user)
- **MongoDB Backend**: Stores users, products, cart; product images via GridFS
- **API Endpoints**: RESTful APIs for frontend and external integrations
- **Conversational AI Chatbot**: Ask about phones, specs, compare models, and automate checkout (powered by LangChain + Google Gemini + ChromaDB)
- **Email Notifications**: Optional SMTP for password reset
- **Testing**: Scripts and test files for API and end-to-end testing

---

## Quick Start

### 1. Clone & Environment Setup

```bash
git clone https://github.com/youruser/yourrepo.git
cd yourrepo
python -m venv .venv
source .venv/bin/activate  # or .\.venv\Scripts\Activate.ps1 on Windows
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Create a `.env` file in the root:

```dotenv
FLASK_SECRET_KEY=change-me
MONGO_URI=mongodb://localhost:27017/
MONGO_DB_NAME=phonestoredb
SMTP_SERVER=smtp.gmail.com         # optional for password reset
SMTP_FROM_EMAIL=you@example.com    # optional
SMTP_FROM_PASSWORD=your-app-pass   # optional
SMTP_USE_TLS=true                  # optional
GEMINI_API_KEY=your_gemini_key     # for chatbot
```

If SMTP is not set, password reset codes print to the server console for dev/testing.

### 3. Seed Products & Create Admin

```bash
python seed_products.py      # Optional: pre-load products
python create_admin.py       # Optional: set up admin user
```

### 4. Run MongoDB

- Local: start `mongod`
- Or use [MongoDB Atlas](https://www.mongodb.com/atlas/database)

### 5. Start the App

```bash
python app.py
# or: flask run
```
Visit [http://localhost:5000/](http://localhost:5000/) in your browser.

---

## API Endpoints (Selection)

- `POST   /api/register`             `{ name, email, password }`
- `POST   /api/login`                `{ email, password }`
- `POST   /api/logout`
- `POST   /api/forgot-password`      `{ email }`
- `POST   /api/reset-password`       `{ email, code, newPassword }`
- `GET    /api/products`
- `GET    /api/products/<id>/image`
- `POST   /api/products`             *(admin, JSON or multipart)*
- `PUT    /api/products/<id>`        *(admin)*
- `DELETE /api/products/<id>`        *(admin)*
- `POST   /api/cart/add`
- `GET    /api/cart/get`
- `POST   /api/chatbot`              *(conversational AI, see below)*

---

## Conversational AI Chatbot (RAG)

**Supercharge your store with a context-aware AI assistant!**

- **RAG (Retrieval-Augmented Generation)**: Combines product database (vectorized with ChromaDB) and Google Gemini LLM for accurate, real-time Q&A.
- **Tech Stack**: [LangChain](https://github.com/langchain-ai/langchain), [ChromaDB](https://www.trychroma.com/), [Google Generative AI](https://ai.google.dev/).
- **Capabilities**:
  - Ask about phone specs/pricing
  - Compare devices (“Compare Galaxy S23 and iPhone 14”)
  - Get recommendations
  - Automate checkout (chatbot collects info, returns checkout JSON)
- **Enable**:
  1. Set `GEMINI_API_KEY` in `.env`
  2. Install Python deps: `pip install -r requirements.txt`
  3. Ensure `chroma_db/chroma.sqlite3` exists (prebuilt with phone data)
  4. Use the chat widget on the main page!

**Chatbot Architecture**:

```
User → [Chat Widget] → [Flask API] → [ChromaDB Retriever] → [Gemini LLM via LangChain] → Response
```

---

## File Structure Highlights

- `app.py`              – Flask backend & API endpoints
- `chatbot_backend.py`  – RAG chatbot logic (LangChain, ChromaDB, Gemini)
- `chroma_db/`          – Vector DB for product specs
- `static/`, `templates/` – Frontend assets
- `test_*.py`           – Test scripts
- `data/`               – Sample product data

---

## Developer Notes & Troubleshooting

- If MongoDB is unavailable, `app.py` prints an error and disables DB features.
- Product image uploads require working GridFS.
- Unique indexes on `users.email` and `products.id` are created if possible.
- If SMTP is missing, password reset codes are printed to the console.

**Testing**:  
Run `pytest` on test files like `test_api.py`.

---

## Contributing

Contributions are welcome! Please open an issue or pull request for bug fixes, features, or documentation improvements.

- Fork the repo and create your branch (`git checkout -b my-feature`)
- Commit your changes
- Push to your fork
- Open a PR describing your change

---

## License

MIT License. See `LICENSE`.

---

## Credits & Acknowledgments

- [LangChain](https://github.com/langchain-ai/langchain)
- [Google Generative AI](https://ai.google.dev/)
- [ChromaDB](https://www.trychroma.com/)

---
