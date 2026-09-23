

let currentUser = null;
let selectedProduct = null;

let currentSlide = 0;
let slideInterval = null;


/* =========================================================
   PRODUCTS
   ========================================================= */

const products = [

    {
        id: 1,
        brand: "Roadster",
        name: "Men Solid Casual Shirt",
        category: "Men",
        price: 799,
        oldPrice: 1499,
        image: "https://images.unsplash.com/photo-1603252110481-7ba873bf42ab"
    },

    {
        id: 2,
        brand: "Tokyo Talkies",
        name: "Women Floral Dress",
        category: "Women",
        price: 999,
        oldPrice: 1999,
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8"
    },

    {
        id: 3,
        brand: "HRX",
        name: "Men Running Shoes",
        category: "Footwear",
        price: 1299,
        oldPrice: 2499,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    },

    {
        id: 4,
        brand: "DressBerry",
        name: "Women Handbag",
        category: "Bags",
        price: 899,
        oldPrice: 1799,
        image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3"
    },

    {
        id: 5,
        brand: "Mast & Harbour",
        name: "Men Casual T-Shirt",
        category: "Men",
        price: 599,
        oldPrice: 1199,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab"
    },

    {
        id: 6,
        brand: "SASSAFRAS",
        name: "Women Crop Top",
        category: "Women",
        price: 699,
        oldPrice: 1299,
        image: "https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3"
    },

    {
        id: 7,
        brand: "Puma",
        name: "Sports Sneakers",
        category: "Footwear",
        price: 1599,
        oldPrice: 2999,
        image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff"
    },

    {
        id: 8,
        brand: "Fastrack",
        name: "Stylish Watch",
        category: "Jewellery",
        price: 1199,
        oldPrice: 2499,
        image: "https://images.unsplash.com/photo-1524805444758-089113d48a6d"
    },

    {
        id: 9,
        brand: "Anouk",
        name: "Women Ethnic Kurta",
        category: "Women",
        price: 899,
        oldPrice: 1799,
        image: "https://images.unsplash.com/photo-1583391733956-6c78276477e2"
    },

    {
        id: 10,
        brand: "Allen Solly",
        name: "Men Formal Shirt",
        category: "Men",
        price: 999,
        oldPrice: 1999,
        image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c"
    },

    {
        id: 11,
        brand: "YK",
        name: "Kids Casual Outfit",
        category: "Kids",
        price: 799,
        oldPrice: 1499,
        image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea"
    },

    {
        id: 12,
        brand: "Lavie",
        name: "Women Shoulder Bag",
        category: "Bags",
        price: 1299,
        oldPrice: 2499,
        image: "https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d"
    }

];


/* =========================================================
   PAGE LOAD
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    checkLogin();

    renderProducts(products);

    setupSearch();

    setupCategoryCards();

    setupSlider();

});


/* =========================================================
   CHECK LOGIN
   ========================================================= */

async function checkLogin() {

    try {

        const response = await fetch("/api/me");

        if (!response.ok) {

            currentUser = null;

            updateUserUI();

            updateBagCount();

            return;
        }

        const data = await response.json();

        if (data.logged_in) {

            currentUser = data.user;

            localStorage.setItem(
                "user",
                JSON.stringify(currentUser)
            );

            updateUserUI();

            updateBagCount();

        } else {

            currentUser = null;

            localStorage.removeItem("user");

            updateUserUI();

            updateBagCount();
        }

    } catch (error) {

        console.error("CHECK LOGIN ERROR:", error);

        currentUser = null;

        updateUserUI();

        updateBagCount();
    }

}


/* =========================================================
   OPEN LOGIN POPUP
   ========================================================= */

function openLogin() {

    const loginOverlay =
        document.getElementById("loginOverlay");

    if (!loginOverlay) {

        console.error("loginOverlay not found");

        return;
    }

    /*
       Remove class first so animation
       starts again every time.
    */

    loginOverlay.classList.remove("show");

    void loginOverlay.offsetWidth;

    loginOverlay.classList.add("show");

    document.body.style.overflow = "hidden";

}


/* =========================================================
   CLOSE LOGIN POPUP
   ========================================================= */

function closeLogin() {

    const loginOverlay =
        document.getElementById("loginOverlay");

    if (loginOverlay) {

        loginOverlay.classList.remove("show");
    }

    document.body.style.overflow = "";

}


/* =========================================================
   CLOSE LOGIN WHEN CLICKING OUTSIDE
   ========================================================= */

function closeLoginOutside(event) {

    const loginOverlay =
        document.getElementById("loginOverlay");

    if (
        loginOverlay &&
        event.target === loginOverlay
    ) {

        closeLogin();
    }

}


/* =========================================================
   LOGIN
   ========================================================= */

async function loginUser(event) {

    event.preventDefault();

    const emailElement =
        document.getElementById("loginEmail");

    const passwordElement =
        document.getElementById("loginPassword");

    const button =
        document.getElementById("loginButton");


    if (!emailElement || !passwordElement) {

        console.error("Login fields not found");

        return;
    }


    const email =
        emailElement.value
            .trim()
            .toLowerCase();

    const password =
        passwordElement.value;


    if (!email || !password) {

        showToast(
            "Please enter email and password"
        );

        return;
    }


    if (button) {

        button.disabled = true;

        button.textContent = "LOGGING IN...";
    }


    try {

        const response =
            await fetch("/api/login", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    email: email,

                    password: password

                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Invalid email or password ❌"
            );

            return;
        }


        /* Login successful */

        currentUser = data.user;


        localStorage.setItem(
            "user",
            JSON.stringify(currentUser)
        );


        updateUserUI();

        closeLogin();


        showToast(
            "Login successful 🎉"
        );


        /*
           If user clicked ADD TO BAG
           before logging in,
           add that product now.
        */

        if (selectedProduct) {

            await sendProductToBag(
                selectedProduct.id
            );

            selectedProduct = null;
        }


        updateBagCount();


    } catch (error) {

        console.error(
            "LOGIN ERROR:",
            error
        );

        showToast(
            "Flask server connection failed ❌"
        );

    } finally {

        if (button) {

            button.disabled = false;

            button.textContent = "LOGIN";
        }

    }

}


/* =========================================================
   LOGOUT
   ========================================================= */

async function logoutUser() {

    try {

        const response =
            await fetch("/api/logout", {

                method: "POST"

            });


        const data =
            await response.json();


        currentUser = null;

        selectedProduct = null;

        localStorage.removeItem("user");


        updateUserUI();

        updateBagCount();


        showToast(
            data.message ||
            "Logged out successfully"
        );


    } catch (error) {

        console.error(
            "LOGOUT ERROR:",
            error
        );

        showToast(
            "Logout failed ❌"
        );

    }

}


/* =========================================================
   UPDATE PROFILE UI
   ========================================================= */

function updateUserUI() {

    const profileAction =
        document.getElementById("profileAction");


    if (!profileAction) return;


    if (currentUser) {

        profileAction.innerHTML = `
            <span class="icon">👤</span>
            ${currentUser.name || "Profile"}
        `;

    } else {

        profileAction.innerHTML = `
            <span class="icon">👤</span>
            Profile
        `;
    }

}


/* =========================================================
   PROFILE
   ========================================================= */

function openProfile() {

    if (!currentUser) {

        openLogin();

        return;
    }


    showToast(
        `Welcome ${currentUser.name} 👋`
    );

}


/* =========================================================
   ADD TO BAG
   ========================================================= */

async function addToBag(productId) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;
    }


    /*
       If user is NOT logged in:

       1. Remember selected product
       2. Open login popup
    */

    if (!currentUser) {

        selectedProduct = product;

        openLogin();

        return;
    }


    /*
       If already logged in,
       directly add product.
    */

    await sendProductToBag(productId);

}


/* =========================================================
   SEND PRODUCT TO FLASK
   ========================================================= */

async function sendProductToBag(productId) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) return;


    try {

        const response =
            await fetch("/api/bag", {

                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({

                    product_id: product.id,

                    brand: product.brand,

                    product_name: product.name,

                    price: product.price,

                    image: product.image

                })

            });


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to add product ❌"
            );

            return;
        }


        showToast(
            "Product added to bag 🛍️"
        );


        updateBagCount();


    } catch (error) {

        console.error(
            "ADD TO BAG ERROR:",
            error
        );

        showToast(
            "Flask server connection failed ❌"
        );

    }

}


/* =========================================================
   OPEN BAG
   ========================================================= */

async function openBag() {

    /*
       User is not logged in
       → show login popup.
    */

    if (!currentUser) {

        openLogin();

        return;
    }


    try {

        const response =
            await fetch("/api/bag");


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to load bag ❌"
            );

            return;
        }


        const itemCount =
            data.bag
                ? data.bag.length
                : 0;


        showToast(
            `Your bag has ${itemCount} item${itemCount === 1 ? "" : "s"} 🛍️`
        );


    } catch (error) {

        console.error(
            "BAG ERROR:",
            error
        );

        showToast(
            "Unable to connect to Flask ❌"
        );

    }

}


/* =========================================================
   UPDATE BAG COUNT
   ========================================================= */

async function updateBagCount() {

    const bagAction =
        document.getElementById("bagAction");


    if (!bagAction) return;


    /*
       Not logged in
    */

    if (!currentUser) {

        bagAction.innerHTML = `
            <span class="icon">🛍️</span>
            Bag
        `;

        return;
    }


    try {

        const response =
            await fetch("/api/bag");


        if (!response.ok) return;


        const data =
            await response.json();


        const count =
            data.bag
                ? data.bag.length
                : 0;


        bagAction.innerHTML = `
            <span class="icon">🛍️</span>
            Bag ${count > 0 ? `(${count})` : ""}
        `;


    } catch (error) {

        console.error(
            "BAG COUNT ERROR:",
            error
        );

    }

}


/* =========================================================
   RENDER PRODUCTS
   ========================================================= */

function renderProducts(productList) {

    const container =
        document.getElementById("products");


    if (!container) {

        console.error(
            "Products container not found"
        );

        return;
    }


    container.innerHTML = "";


    if (productList.length === 0) {

        container.innerHTML = `
            <div style="
                grid-column: 1 / -1;
                text-align: center;
                padding: 50px;
                color: #777;
            ">
                <h3>No products found 😔</h3>
                <p>Try another search.</p>
            </div>
        `;

        return;
    }


    productList.forEach(product => {

        const card =
            document.createElement("div");


        card.className = "card";


        card.innerHTML = `

            <div class="card-img">

                <img
                    src="${product.image}"
                    alt="${product.name}"
                >

                <button
    class="heart"
    type="button"
    onclick="toggleWishlist(${product.id}, this)"
    aria-label="Wishlist"
>
    ♡
</button>

            </div>


            <div class="card-info">

                <div class="brand">
                    ${product.brand}
                </div>

                <div class="desc">
                    ${product.name}
                </div>

                <div class="price">

                    ₹${product.price}

                    <span class="old-price">
                        ₹${product.oldPrice}
                    </span>

                </div>


                <button
                    class="add"
                    type="button"
                    onclick="addToBag(${product.id})"
                >
                    ADD TO BAG
                </button>

            </div>

        `;


        container.appendChild(card);

    });

}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const searchInput =
        document.getElementById("searchInput") ||
        document.querySelector(".search input");


    if (!searchInput) return;


    searchInput.addEventListener(
        "input",
        function () {

            const searchValue =
                this.value
                    .trim()
                    .toLowerCase();


            /*
               Empty search
               → show everything.
            */

            if (!searchValue) {

                renderProducts(products);

                return;
            }


            const filteredProducts =
                products.filter(product => {

                    return (

                        product.brand
                            .toLowerCase()
                            .includes(searchValue)

                        ||

                        product.name
                            .toLowerCase()
                            .includes(searchValue)

                        ||

                        product.category
                            .toLowerCase()
                            .includes(searchValue)

                    );

                });


            renderProducts(
                filteredProducts
            );

        }
    );

}


/* =========================================================
   CATEGORY CARDS
   ========================================================= */

function setupCategoryCards() {

    const categories =
        document.querySelectorAll(
            ".category"
        );


    categories.forEach(card => {

        card.addEventListener(
            "click",
            function () {

                categories.forEach(item => {

                    item.classList.remove(
                        "active"
                    );

                });


                this.classList.add(
                    "active"
                );

            }
        );

    });

}


/* =========================================================
   SHOW CATEGORY
   ========================================================= */

function showCategory(category, card) {

    /*
       Remove active class
       from all categories.
    */

    document.querySelectorAll(
        ".category"
    ).forEach(item => {

        item.classList.remove("active");

    });


    /*
       Add active class
       to clicked category.
    */

    if (card) {

        card.classList.add("active");

    }


    /*
       Filter products.
    */

    const filteredProducts =
        products.filter(
            product =>
                product.category === category
        );


    renderProducts(
        filteredProducts
    );


    /*
       Scroll to products section.
       
       IMPORTANT:
       The HTML uses productSection.
    */

    const productSection =
        document.getElementById(
            "productSection"
        );


    if (productSection) {

        productSection.scrollIntoView({
            behavior: "smooth"
        });

    }

}


/* =========================================================
   SHOW ALL PRODUCTS
   ========================================================= */

function showAllProducts() {

    document
        .querySelectorAll(".category")
        .forEach(card => {

            card.classList.remove(
                "active"
            );

        });


    renderProducts(products);

}


/* =========================================================
   WISHLIST / HEART
   ========================================================= */

/* =========================================================
   WISHLIST
   ========================================================= */

async function toggleWishlist(productId, button) {

    const product =
        products.find(
            item => item.id === productId
        );


    if (!product) {

        console.error(
            "Product not found:",
            productId
        );

        return;
    }


    /* -----------------------------------------------------
       LOGIN REQUIRED
       ----------------------------------------------------- */

    if (!currentUser) {

        openLogin();

        return;
    }


    /*
       If already liked,
       remove it.
    */

    if (button.classList.contains("liked")) {

        try {

            const response =
                await fetch("/api/wishlist");


            const data =
                await response.json();


            if (!response.ok) {

                showToast(
                    data.message ||
                    "Unable to load wishlist ❌"
                );

                return;
            }


            const item =
                data.wishlist.find(
                    item =>
                        item.product_id === productId
                );


            if (!item) {

                button.classList.remove("liked");

                button.textContent = "♡";

                return;
            }


            const deleteResponse =
                await fetch(
                    `/api/wishlist/${item.id}`,
                    {
                        method: "DELETE"
                    }
                );


            const deleteData =
                await deleteResponse.json();


            if (!deleteResponse.ok) {

                showToast(
                    deleteData.message ||
                    "Unable to remove ❌"
                );

                return;
            }


            button.classList.remove("liked");

            button.textContent = "♡";

            showToast(
                "Removed from wishlist"
            );


        } catch (error) {

            console.error(
                "REMOVE WISHLIST ERROR:",
                error
            );

            showToast(
                "Flask server connection failed ❌"
            );
        }

        return;
    }


    /* -----------------------------------------------------
       ADD TO WISHLIST
       ----------------------------------------------------- */

    try {

        const response =
            await fetch(
                "/api/wishlist",
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        product_id:
                            product.id,

                        brand:
                            product.brand,

                        product_name:
                            product.name,

                        price:
                            product.price,

                        image:
                            product.image

                    })
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to add wishlist ❌"
            );

            return;
        }


        button.classList.add("liked");

        button.textContent = "♥";


        showToast(
            "Added to wishlist ❤️"
        );


    } catch (error) {

        console.error(
            "ADD WISHLIST ERROR:",
            error
        );

        showToast(
            "Flask server connection failed ❌"
        );
    }

}


/* =========================================================
   SLIDER
   ========================================================= */

function setupSlider() {

    const slides =
        document.querySelector(
            ".slides"
        );


    const dots =
        document.querySelectorAll(
            ".dot"
        );


    const slideElements =
        document.querySelectorAll(
            ".slide"
        );


    if (
        !slides ||
        slideElements.length === 0
    ) {

        return;
    }


    const totalSlides =
        slideElements.length;


    /*
       Update slider position.
    */

    function updateSlider() {

        slides.style.transform =
            `translateX(-${currentSlide * 100}%)`;


        dots.forEach(
            (dot, index) => {

                dot.classList.toggle(
                    "active",
                    index === currentSlide
                );

            }
        );

    }


    /* -----------------------------------------------------
       NEXT SLIDE
       ----------------------------------------------------- */

    window.nextSlide = function () {

        currentSlide++;


        if (
            currentSlide >= totalSlides
        ) {

            currentSlide = 0;

        }


        updateSlider();

    };


    /* -----------------------------------------------------
       PREVIOUS SLIDE
       ----------------------------------------------------- */

    window.prevSlide = function () {

        currentSlide--;


        if (currentSlide < 0) {

            currentSlide =
                totalSlides - 1;

        }


        updateSlider();

    };


    /* -----------------------------------------------------
       GO TO SPECIFIC SLIDE
       ----------------------------------------------------- */

    window.goToSlide = function (index) {

        currentSlide = index;

        updateSlider();

    };


    /* -----------------------------------------------------
       AUTOMATIC SLIDER
       ----------------------------------------------------- */

    clearInterval(slideInterval);


    slideInterval =
        setInterval(
            window.nextSlide,
            5000
        );


    updateSlider();

}


/* =========================================================
   TOAST MESSAGE
   ========================================================= */

function showToast(message) {

    const toast =
        document.getElementById(
            "toast"
        );


    if (!toast) {

        console.log(message);

        return;
    }


    toast.textContent = message;


    toast.classList.add(
        "show"
    );


    clearTimeout(
        window.toastTimer
    );


    window.toastTimer =
        setTimeout(
            function () {

                toast.classList.remove(
                    "show"
                );

            },
            2500
        );

}


/* =========================================================
   ESC KEY
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            closeLogin();

        }

    }
);
/* =========================================================
   OPEN WISHLIST
   ========================================================= */

async function openWishlist() {

    if (!currentUser) {

        openLogin();

        return;
    }


    try {

        const response =
            await fetch("/api/wishlist");


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to load wishlist ❌"
            );

            return;
        }


        showWishlistPage(data.wishlist);


    } catch (error) {

        console.error(
            "WISHLIST ERROR:",
            error
        );

        showToast(
            "Unable to connect to Flask ❌"
        );
    }

}/* =========================================================
   SHOW WISHLIST
   ========================================================= */

function showWishlistPage(wishlist) {

    const container =
        document.getElementById(
            "products"
        );


    if (!container) return;


    if (!wishlist || wishlist.length === 0) {

        container.innerHTML = `

            <div class="empty-wishlist">

                <div class="empty-heart">
                    ♡
                </div>

                <h2>
                    Your Wishlist is Empty
                </h2>

                <p>
                    Save your favourite products here.
                </p>

                <button
                    onclick="showAllProducts()"
                >
                    CONTINUE SHOPPING
                </button>

            </div>

        `;

        const section =
            document.getElementById(
                "productSection"
            );

        if (section) {

            section.scrollIntoView({
                behavior: "smooth"
            });

        }

        return;
    }


    container.innerHTML = "";


    wishlist.forEach(item => {

        const card =
            document.createElement("div");


        card.className =
            "card wishlist-card";


        card.innerHTML = `

            <div class="card-img">

                <img
                    src="${item.image}"
                    alt="${item.product_name}"
                >

                <button
                    class="heart liked"
                    type="button"
                    onclick="removeWishlistItem(
                        ${item.id},
                        this
                    )"
                >
                    ♥
                </button>

            </div>


            <div class="card-info">

                <div class="brand">
                    ${item.brand}
                </div>

                <div class="desc">
                    ${item.product_name}
                </div>

                <div class="price">
                    ₹${item.price}
                </div>


                <button
                    class="add"
                    type="button"
                    onclick="addToBag(${item.product_id})"
                >
                    ADD TO BAG
                </button>

            </div>

        `;


        container.appendChild(card);

    });


    const section =
        document.getElementById(
            "productSection"
        );


    if (section) {

        section.scrollIntoView({
            behavior: "smooth"
        });

    }

}/* =========================================================
   REMOVE WISHLIST ITEM
   ========================================================= */

async function removeWishlistItem(
    wishlistId,
    button
) {

    try {

        const response =
            await fetch(
                `/api/wishlist/${wishlistId}`,
                {
                    method: "DELETE"
                }
            );


        const data =
            await response.json();


        if (!response.ok) {

            showToast(
                data.message ||
                "Unable to remove ❌"
            );

            return;
        }


        showToast(
            "Removed from wishlist"
        );


        /*
           Reload wishlist
        */

        openWishlist();


    } catch (error) {

        console.error(
            "REMOVE WISHLIST ERROR:",
            error
        );

        showToast(
            "Flask server connection failed ❌"
        );
    }

}