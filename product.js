import { db } from "./firebase-config.js";
import { collection, getDocs, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";
import { auth } from "./firebase-config.js"; // Ensure you import Firebase Auth

const menuContainer = document.getElementById('menu');


// Fetch menu data from Firestore
async function fetchMenu() {
    menuContainer.innerHTML = "";

    const menuDocRef = doc(db, "Menu", "menuItems");
    const subcollections = ["burger-items", "pizza-items"];

    for (const subcollection of subcollections) {
        const querySnapshot = await getDocs(collection(menuDocRef, subcollection));

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const itemId = docSnap.id; // Unique item ID
            const itemElement = document.createElement('div');
            itemElement.classList.add('menu-item');

            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}" style="width: 90%; height: 200px; object-fit: cover; border-radius: 5px;">
                <h3>${item.name}</h3>
                <p>₹${item.price}</p>
                <button class="cart-button" data-id="${itemId}">Add to Cart</button>
            `;

            menuContainer.appendChild(itemElement);
        });
    }

    // Check cart status for the logged-in user
    checkCartStatus();

    // Attach event listeners
    document.querySelectorAll('.cart-button').forEach(button => {
        button.addEventListener('click', async function () {
            const parent = this.parentElement;
            const itemData = {
                id: this.getAttribute("data-id"),
                name: parent.querySelector("h3").innerText,
                price: parseFloat(parent.querySelector("p").innerText.replace("₹", "")),
                image: parent.querySelector("img").src,
                quantity: 1
            };

            await addToCart(this, itemData);
        });
    });
}

// Function to check if an item is already in the cart
async function checkCartStatus() {
    const user = auth.currentUser;
    if (!user) return; // Ensure user is logged in

    const cartRef = collection(db, `Users/${user.uid}/Cart`);
    const cartSnapshot = await getDocs(cartRef);

    const cartItems = cartSnapshot.docs.map(doc => doc.id); // Store cart item IDs

    document.querySelectorAll('.cart-button').forEach(button => {
        if (cartItems.includes(button.getAttribute("data-id"))) {
            button.classList.add("added");
            button.innerText = "Added";
            button.disabled = true;
        }
    });
}

// Function to add item to Firebase Firestore (User-specific cart)
async function addToCart(button, product) {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to add items to the cart!");
            return;
        }

        const cartItemRef = doc(db, `Users/${user.uid}/Cart/${product.id}`);

        await setDoc(cartItemRef, {
            name: product.name,
            price: product.price || 0,
            quantity: product.quantity || 1,
            image: product.image
        }, { merge: true });

        // Change button appearance
        button.classList.add("added");
        button.innerText = "Added";
        button.disabled = true;
    } catch (error) {
        console.error("Error adding item to cart:", error);
    }
}

// Listen for Auth state changes
auth.onAuthStateChanged((user) => {
    if (user) {
        fetchMenu();
    } else {
        menuContainer.innerHTML = "<p>Please log in to view the menu.</p>";
    }
});

