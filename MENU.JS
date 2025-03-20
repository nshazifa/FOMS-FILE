// import { db } from "./firebase-config.js";
// import { collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
// import { auth } from "./firebase-config.js"; // Ensure you import Firebase Auth


// const menuContainer = document.getElementById("menu");


// // FETCH MENU DATA FROM FIRESTORE
// async function fetchProducts() {
//     if (!menuContainer) return; // Prevent errors if container is missing

//     menuContainer.innerHTML = ""; // Clear previous data before fetching new

//     const menuDocRef = doc(db, "Menu", "menuItems");
//     const subcollections = ["burger-items", "pizza-items", "momos-items", "desert-items", "drinks-items"];

//     for (const subcollection of subcollections) {
//         const querySnapshot = await getDocs(collection(menuDocRef, subcollection));

//         querySnapshot.forEach((docSnap) => {
//             const item = docSnap.data();
//             addProductToPage(item);
//         });
//     }
// }

// // DISPLAY PRODUCT ON PAGE
// function addProductToPage(item) {
//     const productCard = document.createElement("div");
//     productCard.classList.add("menu-item"); // Keeping your existing class

//     productCard.innerHTML = `
//         <img src="${item.image}" alt="${item.name}" class="menu-img">
//         <h3>${item.name}</h3>
//         <p>₹${item.price}</p>
//         <button class="add-to-cart-btn">Add to Cart</button>
//     `;

//     menuContainer.appendChild(productCard);
// }

// // LOAD PRODUCTS WHEN PAGE LOADS
// document.addEventListener("DOMContentLoaded", fetchProducts);


// // FUNCTION TO CHECK IF AN ITEM IS ALREADY IN THE CART
// async function checkCartStatus() {
//     const user = auth.currentUser;
//     if (!user) return; // Ensure user is logged in

//     const cartRef = collection(db, `Users/${user.uid}/Cart`);
//     const cartSnapshot = await getDocs(cartRef);

//     const cartItems = cartSnapshot.docs.map(doc => doc.id); // Store cart item IDs

//     document.querySelectorAll('.cart-button').forEach(button => {
//         if (cartItems.includes(button.getAttribute("data-id"))) {
//             button.classList.add("added");
//             button.innerText = "Added";
//             button.disabled = true;
//         }
//     });
// }

// // FUNCTION TO ADD ITEM TO FIREBASE FIRESTORE (USER-SPECIFIC CART)
// async function addToCart(button, product) {
//     try {
//         const user = auth.currentUser;
//         if (!user) {
//             alert("Please log in to add items to the cart!");
//             return;
//         }

//         const cartItemRef = doc(db, `Users/${user.uid}/Cart/${product.id}`);

//         await setDoc(cartItemRef, {
//             name: product.name,
//             price: product.price || 0,
//             quantity: product.quantity || 1,
//             image: product.image
//         }, { merge: true });

//         // CHANGE BUTTON APPEARANCE AFTER ADDING TO CART
//         button.classList.add("added");
//         button.innerText = "Added";
//         button.disabled = true;
//     } catch (error) {
//         console.error("Error adding item to cart:", error);
//     }
// }


// // LISTEN FOR AUTH STATE CHANGES
// auth.onAuthStateChanged((user) => {
//     if (user) {
//         fetchMenu();
//     } else {
//         menuContainer.innerHTML = "<p>Please log in to view the menu.</p>";
//     }
// });
import { db } from "./firebase-config.js";
import { collection, getDocs, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth } from "./firebase-config.js"; // Ensure you import Firebase Auth

const menuContainer = document.getElementById("menu");

// FETCH MENU DATA FROM FIRESTORE
async function fetchProducts() {
    if (!menuContainer) return; // Prevent errors if container is missing

    menuContainer.innerHTML = ""; // Clear previous data before fetching new

    const menuDocRef = doc(db, "Menu", "menuItems");
    const subcollections = ["burger-items", "pizza-items", "momos-items", "desert-items", "drinks-items"];

    for (const subcollection of subcollections) {
        const querySnapshot = await getDocs(collection(menuDocRef, subcollection));

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            addProductToPage(item, docSnap.id); // Pass doc ID for cart handling
        });
    }

    // Check cart status after products are loaded
    checkCartStatus();
}

// DISPLAY PRODUCT ON PAGE
function addProductToPage(item, productId) {
    const productCard = document.createElement("div");
    productCard.classList.add("menu-item");

    productCard.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="menu-img">
        <h3>${item.name}</h3>
        <p>₹${item.price}</p>
        <button class="add-to-cart-btn" data-id="${productId}">Add to Cart</button>
    `;

    const addToCartButton = productCard.querySelector(".add-to-cart-btn");
    addToCartButton.addEventListener("click", () => addToCart(addToCartButton, item, productId)); // Pass the product id

    menuContainer.appendChild(productCard);
}

// LOAD PRODUCTS WHEN PAGE LOADS
document.addEventListener("DOMContentLoaded", fetchProducts);

// FUNCTION TO CHECK IF AN ITEM IS ALREADY IN THE CART
async function checkCartStatus() {
    const user = auth.currentUser;
    if (!user) return; // Ensure user is logged in

    const cartRef = collection(db, `Users/${user.uid}/Cart`);
    const cartSnapshot = await getDocs(cartRef);

    const cartItems = cartSnapshot.docs.map(doc => doc.id); // Store cart item IDs

    document.querySelectorAll('.add-to-cart-btn').forEach(button => {
        const productId = button.getAttribute("data-id");
        if (cartItems.includes(productId)) {
            button.classList.add("added");
            button.innerText = "Added";
            button.disabled = true;
        }
    });
}

// FUNCTION TO ADD ITEM TO FIREBASE FIRESTORE (USER-SPECIFIC CART)
async function addToCart(button, product, productId) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to add items to the cart!");
            return;
        }

        const cartItemRef = doc(db, `Users/${user.uid}/Cart/${productId}`);

        await setDoc(cartItemRef, {
            name: product.name,
            price: product.price || 0,
            quantity: 1,
            image: product.image
        }, { merge: true });

        // CHANGE BUTTON APPEARANCE AFTER ADDING TO CART
        button.classList.add("added");
        button.innerText = "Added";
        button.disabled = true;
    } catch (error) {
        console.error("Error adding item to cart:", error);
    }
}

// LISTEN FOR AUTH STATE CHANGES
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchProducts();
    } else {
        menuContainer.innerHTML = "<p>Please log in to view the menu.</p>";
    }
});
