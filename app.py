from flask import Flask, render_template, request, jsonify, session
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import os

app = Flask(__name__, template_folder="templates")

# =========================================================
# FLASK SESSION SECRET
# =========================================================
# Change this to your own long random secret.
app.secret_key = os.environ.get(
    "FLASK_SECRET_KEY",
    "CHANGE_THIS_TO_A_RANDOM_SECRET_KEY"
)

# =========================================================
# MYSQL CONFIGURATION
# =========================================================
# IMPORTANT:
# Put your real MySQL password here, or set MYSQL_PASSWORD
# as an environment variable.
DB_CONFIG = {
    "host": "localhost",
    "user": "root",
    "password": "ASHIKA1804",
    "database": "fashion_hub"
}

# =========================================================
# PRODUCTS
# =========================================================
PRODUCTS = [
    {
        "id": 1,
        "brand": "Urban Style",
        "name": "Printed casual shirt",
        "category": "Men",
        "price": 899,
        "old_price": 1799,
        "image": "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 2,
        "brand": "Street Mode",
        "name": "Oversized graphic t-shirt",
        "category": "Men",
        "price": 699,
        "old_price": 1299,
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 3,
        "brand": "Luxe Wear",
        "name": "Elegant women's dress",
        "category": "Women",
        "price": 1499,
        "old_price": 2999,
        "image": "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 4,
        "brand": "Daily Edit",
        "name": "Classic sneakers",
        "category": "Footwear",
        "price": 1199,
        "old_price": 2499,
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 5,
        "brand": "Glow Gold",
        "name": "Elegant gold necklace",
        "category": "Jewellery",
        "price": 2499,
        "old_price": 4999,
        "image": "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 6,
        "brand": "Urban Bags",
        "name": "Premium shoulder bag",
        "category": "Bags",
        "price": 1299,
        "old_price": 2599,
        "image": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 7,
        "brand": "Kids World",
        "name": "Cute kids casual outfit",
        "category": "Kids",
        "price": 799,
        "old_price": 1499,
        "image": "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 8,
        "brand": "Fashion Point",
        "name": "Women's casual top",
        "category": "Women",
        "price": 799,
        "old_price": 1599,
        "image": "https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 9,
        "brand": "Denim Hub",
        "name": "Men's denim jacket",
        "category": "Men",
        "price": 1599,
        "old_price": 2999,
        "image": "https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 10,
        "brand": "Step Up",
        "name": "Running sports shoes",
        "category": "Footwear",
        "price": 1499,
        "old_price": 2999,
        "image": "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 11,
        "brand": "Shine",
        "name": "Fashion earrings",
        "category": "Jewellery",
        "price": 599,
        "old_price": 1199,
        "image": "https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=700&q=80",
    },
    {
        "id": 12,
        "brand": "Carry Easy",
        "name": "Stylish handbag",
        "category": "Bags",
        "price": 999,
        "old_price": 1999,
        "image": "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80",
    },
]


# =========================================================
# DATABASE HELPERS
# =========================================================
def get_db_connection():
    return mysql.connector.connect(**DB_CONFIG)


def get_server_connection():
    """Connect to MySQL without selecting fashion_hub."""
    config = DB_CONFIG.copy()
    config.pop("database", None)
    return mysql.connector.connect(**config)


def close_db(connection=None, cursor=None):
    try:
        if cursor is not None:
            cursor.close()
    except Exception:
        pass

    try:
        if connection is not None and connection.is_connected():
            connection.close()
    except Exception:
        pass


def initialize_database():
    """
    Creates the database and required tables automatically.
    This fixes the common 'table wishlist doesn't exist' problem.
    """
    server_connection = None
    server_cursor = None
    connection = None
    cursor = None

    try:
        server_connection = get_server_connection()
        server_cursor = server_connection.cursor()
        server_cursor.execute(
            "CREATE DATABASE IF NOT EXISTS fashion_hub "
            "CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
        )
        server_connection.commit()

        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(100) NOT NULL,
                email VARCHAR(150) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS bag (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                brand VARCHAR(100) NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                price INT NOT NULL,
                image TEXT NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                UNIQUE KEY unique_bag_product (user_id, product_id)
            ) ENGINE=InnoDB
        """)

        cursor.execute("""
            CREATE TABLE IF NOT EXISTS wishlist (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                product_id INT NOT NULL,
                brand VARCHAR(100) NOT NULL,
                product_name VARCHAR(255) NOT NULL,
                price INT NOT NULL,
                image TEXT NOT NULL,
                added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id)
                    REFERENCES users(id)
                    ON DELETE CASCADE,
                UNIQUE KEY unique_user_product (user_id, product_id)
            ) ENGINE=InnoDB
        """)

        connection.commit()
        print("Database and tables are ready.")

    except Error as error:
        print("DATABASE INITIALIZATION ERROR:", error)
        raise

    finally:
        close_db(server_connection, server_cursor)
        close_db(connection, cursor)


def find_product(product_id):
    try:
        product_id = int(product_id)
    except (TypeError, ValueError):
        return None

    return next(
        (product for product in PRODUCTS if product["id"] == product_id),
        None,
    )


# =========================================================
# HOME PAGE
# =========================================================
@app.route("/")
def home():
    # Supports either mytra.html or myntra.html.
    if os.path.exists(os.path.join(app.template_folder, "index.html")):
        return render_template("index.html")

    return render_template("index.html")


# =========================================================
# SIGNUP PAGE
# =========================================================
@app.route("/signup")
def signup_page():
    return render_template("signup.html")


# =========================================================
# SIGNUP API
# =========================================================
@app.route("/api/signup", methods=["POST"])
def signup():
    data = request.get_json(silent=True) or {}

    name = str(data.get("name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not name or not email or not password:
        return jsonify({
            "success": False,
            "message": "All fields are required",
        }), 400

    if len(password) < 6:
        return jsonify({
            "success": False,
            "message": "Password must contain at least 6 characters",
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            "SELECT id FROM users WHERE email = %s",
            (email,),
        )
        existing_user = cursor.fetchone()

        if existing_user:
            return jsonify({
                "success": False,
                "message": "Email already registered",
            }), 409

        hashed_password = generate_password_hash(password)

        cursor.execute(
            """
            INSERT INTO users (name, email, password)
            VALUES (%s, %s, %s)
            """,
            (name, email, hashed_password),
        )

        user_id = cursor.lastrowid
        connection.commit()

        session.clear()
        session["user_id"] = user_id

        return jsonify({
            "success": True,
            "message": "Account created successfully",
            "user": {
                "id": user_id,
                "name": name,
                "email": email,
            },
        }), 201

    except Error as error:
        if connection:
            connection.rollback()

        print("SIGNUP MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to create account",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# LOGIN API
# =========================================================
@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}

    email = str(data.get("email", "")).strip().lower()
    password = str(data.get("password", ""))

    if not email or not password:
        return jsonify({
            "success": False,
            "message": "Email and password are required",
        }), 400

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, email, password
            FROM users
            WHERE email = %s
            """,
            (email,),
        )

        user = cursor.fetchone()

        if user is None:
            return jsonify({
                "success": False,
                "message": "Account not found",
            }), 401

        if not check_password_hash(user["password"], password):
            return jsonify({
                "success": False,
                "message": "Incorrect password",
            }), 401

        session.clear()
        session["user_id"] = user["id"]

        return jsonify({
            "success": True,
            "message": "Login successful",
            "user": {
                "id": user["id"],
                "name": user["name"],
                "email": user["email"],
            },
        }), 200

    except Error as error:
        print("LOGIN MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Database connection failed",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# CURRENT USER
# =========================================================
@app.route("/api/me", methods=["GET"])
def current_user():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "logged_in": False,
        }), 200

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, name, email
            FROM users
            WHERE id = %s
            """,
            (user_id,),
        )

        user = cursor.fetchone()

        if user is None:
            session.clear()

            return jsonify({
                "logged_in": False,
            }), 200

        return jsonify({
            "logged_in": True,
            "user": user,
        }), 200

    except Error as error:
        print("CURRENT USER MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Database error",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# ADD TO BAG
# =========================================================
@app.route("/api/bag", methods=["POST"])
def add_to_bag():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first",
        }), 401

    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")

    if product_id is None:
        return jsonify({
            "success": False,
            "message": "Product ID is required",
        }), 400

    product = find_product(product_id)

    if product is None:
        return jsonify({
            "success": False,
            "message": "Product not found",
        }), 404

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id
            FROM bag
            WHERE user_id = %s AND product_id = %s
            """,
            (user_id, product["id"]),
        )

        existing = cursor.fetchone()

        if existing:
            return jsonify({
                "success": True,
                "already_exists": True,
                "message": "Product already in your bag",
                "bag_id": existing["id"],
            }), 200

        cursor.execute(
            """
            INSERT INTO bag
            (user_id, product_id, brand, product_name, price, image)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                product["id"],
                product["brand"],
                product["name"],
                product["price"],
                product["image"],
            ),
        )

        bag_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "success": True,
            "message": f"{product['brand']} added to bag",
            "bag_id": bag_id,
        }), 201

    except Error as error:
        if connection:
            connection.rollback()

        print("ADD BAG MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to add product to bag",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# GET BAG
# =========================================================
@app.route("/api/bag", methods=["GET"])
def get_bag():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first",
        }), 401

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, product_id, brand, product_name,
                   price, image, added_at
            FROM bag
            WHERE user_id = %s
            ORDER BY id DESC
            """,
            (user_id,),
        )

        rows = cursor.fetchall()

        items = [
            {
                "id": row["id"],
                "product_id": row["product_id"],
                "brand": row["brand"],
                "name": row["product_name"],
                "price": row["price"],
                "image": row["image"],
                "added_at": str(row["added_at"]),
            }
            for row in rows
        ]

        return jsonify({
            "success": True,
            "count": len(items),
            "items": items,
            "bag": items,
        }), 200

    except Error as error:
        print("GET BAG MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to load bag",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# REMOVE FROM BAG
# =========================================================
@app.route("/api/bag/<int:bag_id>", methods=["DELETE"])
def remove_from_bag(bag_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first",
        }), 401

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM bag
            WHERE id = %s AND user_id = %s
            """,
            (bag_id, user_id),
        )

        deleted = cursor.rowcount
        connection.commit()

        if deleted == 0:
            return jsonify({
                "success": False,
                "message": "Product not found",
            }), 404

        return jsonify({
            "success": True,
            "message": "Product removed from bag",
        }), 200

    except Error as error:
        if connection:
            connection.rollback()

        print("REMOVE BAG MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to remove product",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# WISHLIST - ADD
# =========================================================
@app.route("/api/wishlist", methods=["POST"])
def add_to_wishlist():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first",
        }), 401

    data = request.get_json(silent=True) or {}
    product_id = data.get("product_id")

    if product_id is None:
        return jsonify({
            "success": False,
            "message": "Product ID is required",
        }), 400

    product = find_product(product_id)

    if product is None:
        return jsonify({
            "success": False,
            "message": "Product not found",
        }), 404

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        # Check first so clicking the heart twice does not create duplicates.
        cursor.execute(
            """
            SELECT id
            FROM wishlist
            WHERE user_id = %s AND product_id = %s
            """,
            (user_id, product["id"]),
        )

        existing = cursor.fetchone()

        if existing:
            return jsonify({
                "success": True,
                "already_exists": True,
                "message": "Product already in wishlist",
                "wishlist_id": existing["id"],
            }), 200

        cursor.execute(
            """
            INSERT INTO wishlist
            (user_id, product_id, brand, product_name, price, image)
            VALUES (%s, %s, %s, %s, %s, %s)
            """,
            (
                user_id,
                product["id"],
                product["brand"],
                product["name"],
                product["price"],
                product["image"],
            ),
        )

        wishlist_id = cursor.lastrowid
        connection.commit()

        return jsonify({
            "success": True,
            "message": "Added to wishlist",
            "wishlist_id": wishlist_id,
        }), 201

    except Error as error:
        if connection:
            connection.rollback()

        print("ADD WISHLIST MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to add to wishlist",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# WISHLIST - GET
# =========================================================
@app.route("/api/wishlist", methods=["GET"])
def get_wishlist():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first",
        }), 401

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor(dictionary=True)

        cursor.execute(
            """
            SELECT id, product_id, brand, product_name,
                   price, image, added_at
            FROM wishlist
            WHERE user_id = %s
            ORDER BY id DESC
            """,
            (user_id,),
        )

        rows = cursor.fetchall()

        wishlist = [
            {
                "id": row["id"],
                "product_id": row["product_id"],
                "brand": row["brand"],
                "name": row["product_name"],
                "product_name": row["product_name"],
                "price": row["price"],
                "image": row["image"],
                "added_at": str(row["added_at"]),
            }
            for row in rows
        ]

        return jsonify({
            "success": True,
            "wishlist": wishlist,
            "items": wishlist,
            "count": len(wishlist),
        }), 200

    except Error as error:
        print("GET WISHLIST MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to load wishlist",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# WISHLIST - REMOVE
# =========================================================
@app.route("/api/wishlist/<int:wishlist_id>", methods=["DELETE"])
def remove_from_wishlist(wishlist_id):
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "success": False,
            "message": "Please login first",
        }), 401

    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()

        cursor.execute(
            """
            DELETE FROM wishlist
            WHERE id = %s AND user_id = %s
            """,
            (wishlist_id, user_id),
        )

        deleted = cursor.rowcount
        connection.commit()

        if deleted == 0:
            return jsonify({
                "success": False,
                "message": "Product not found in wishlist",
            }), 404

        return jsonify({
            "success": True,
            "message": "Removed from wishlist",
        }), 200

    except Error as error:
        if connection:
            connection.rollback()

        print("REMOVE WISHLIST MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "message": "Unable to remove product",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# LOGOUT
# =========================================================
@app.route("/api/logout", methods=["POST"])
def logout():
    session.clear()

    return jsonify({
        "success": True,
        "message": "Logged out successfully",
    }), 200


# =========================================================
# HEALTH CHECK
# =========================================================
@app.route("/api/health", methods=["GET"])
def health():
    connection = None
    cursor = None

    try:
        connection = get_db_connection()
        cursor = connection.cursor()
        cursor.execute("SELECT 1")
        cursor.fetchone()

        return jsonify({
            "success": True,
            "flask": "connected",
            "mysql": "connected",
        }), 200

    except Error as error:
        print("HEALTH CHECK MYSQL ERROR:", error)

        return jsonify({
            "success": False,
            "flask": "connected",
            "mysql": "disconnected",
            "message": "MySQL connection failed",
        }), 500

    finally:
        close_db(connection, cursor)


# =========================================================
# START FLASK
# =========================================================
if __name__ == "__main__":
    print("=" * 55)
    print("                 FASHION HUB")
    print("=" * 55)

    try:
        initialize_database()
    except Exception:
        print("\nCould not initialize MySQL.")
        print("Check that:")
        print("1. MySQL Server is running.")
        print("2. MYSQL_PASSWORD is correct.")
        print("3. MySQL user 'root' has permission to create databases.")
        raise

    print("Server running at:")
    print("http://127.0.0.1:5000")
    print("=" * 55)

    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True,
        use_reloader=False,
    )
