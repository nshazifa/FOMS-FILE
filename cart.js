// Import Firebase configuration and authentication modules
import { db, auth } from "./firebase-config.js";
import { collection, getDocs, updateDoc, doc, deleteDoc, setDoc } 
    from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

async function loadCart() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to view your cart.");
            return;
        }

        const userId = user.uid;
        const cartContainer = document.getElementById("cartItems");
        const totalPriceElement = document.getElementById("totalPrice");
        const checkoutButton = document.getElementById("placeOrderButton");

        cartContainer.innerHTML = "";

        const cartRef = collection(db, `Users/${userId}/Cart`);
        const querySnapshot = await getDocs(cartRef);
        let grandTotal = 0;

        if (querySnapshot.empty) {
            cartContainer.innerHTML = "<li>Your cart is empty.</li>";
            checkoutButton.disabled = true;
            totalPriceElement.textContent = "Total: ₹0";
            return;
        }

        querySnapshot.forEach((docSnap) => {
            const item = docSnap.data();
            const itemId = docSnap.id;
            const price = item.price || 0;
            const quantity = item.quantity || 1;
            const rowTotal = price * quantity;
            grandTotal += rowTotal;

            const listItem = document.createElement("li");
            listItem.classList.add("cart-item-container");
            listItem.innerHTML = `
                <span>•</span>
                <img src="${item.image}" style="width: 45px; height: 50px;">
                <span class="product-name">${item.name}</span>
                <span class="quantity-display">x${quantity}</span>
                <div class="quantity-controls">
                    <button class="decrease" data-id="${itemId}" data-quantity="${quantity}">-</button>
                    <button class="increase" data-id="${itemId}" data-quantity="${quantity}">+</button>
                </div>
                <span class="row-total">₹${rowTotal.toFixed(2)}</span>
            `;
            cartContainer.appendChild(listItem);
        });

        totalPriceElement.textContent = `Total: ₹${grandTotal.toFixed(2)}`;
        checkoutButton.disabled = false;
    } catch (error) {
        console.error("Error loading cart:", error);
        alert("Failed to load cart. Please try again.");
    }
}

async function updateQuantity(userId, itemId, newQuantity) {
    try {
        const itemRef = doc(db, `Users/${userId}/Cart`, itemId);
        if (newQuantity < 1) {
            await deleteDoc(itemRef);
        } else {
            await updateDoc(itemRef, { quantity: newQuantity });
        }
        loadCart();
    } catch (error) {
        console.error("Error updating quantity:", error);
    }
}

async function proceedToCheckout() {
    try {
        const user = auth.currentUser;
        if (!user) {
            alert("Please log in to proceed.");
            return;
        }

        const userId = user.uid;
        const cartRef = collection(db, `Users/${userId}/Cart`);
        const querySnapshot = await getDocs(cartRef);

        if (querySnapshot.empty) {
            alert("Your cart is empty. Please add items before proceeding.");
            return;
        }

        window.location.href = "checkout.html";
    } catch (error) {
        console.error("Error processing checkout:", error);
        alert("Failed to proceed to checkout. Please try again.");
    }
}

document.getElementById("placeOrderButton").addEventListener("click", proceedToCheckout);

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
onAuthStateChanged(auth, (user) => {
    if (user) {
        loadCart();
    } else {
        document.getElementById("cartItems").innerHTML = "<li>Please log in to view your cart.</li>";
    }
});

//     // Import Firebase configuration and authentication modules
//     import { db, auth } from "./firebase-config.js";
//     import { collection, getDocs, updateDoc, doc, deleteDoc, setDoc } 
//         from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

//     async function loadCart() {
//         try {
//             const user = auth.currentUser;
//             if (!user) {
//                 alert("Please log in to view your cart.");
//                 return;
//             }

//             const userId = user.uid;
//             const cartContainer = document.getElementById("cartItems");
//             const totalPriceElement = document.getElementById("totalPrice");
//             const checkoutButton = document.getElementById("placeOrderButton");

//             cartContainer.innerHTML = "";

//             const cartRef = collection(db, `Users/${userId}/Cart`);
//             const querySnapshot = await getDocs(cartRef);
//             let grandTotal = 0;

//             if (querySnapshot.empty) {
//                 cartContainer.innerHTML = "<li>Your cart is empty.</li>";
//                 checkoutButton.disabled = true;
//                 totalPriceElement.textContent = "Total: ₹0";
//                 return;
//             }

//             querySnapshot.forEach((docSnap) => {
//                 const item = docSnap.data();
//                 const itemId = docSnap.id;

//                 const price = item.price || 0;
//                 const quantity = item.quantity || 1;
//                 const rowTotal = price * quantity;
//                 grandTotal += rowTotal;

//                 const listItem = document.createElement("li");
//                 listItem.classList.add("cart-item-container");

//                 listItem.innerHTML = `
//                     <span>•</span>
//                     <img src="${item.image}" style="width: 45px; height: 50px;">
//                     <span class="product-name">${item.name}</span>
//                     <span class="quantity-display">x${quantity}</span>
//                     <div class="quantity-controls">
//                         <button class="decrease" data-id="${itemId}" data-quantity="${quantity}">-</button>
//                         <button class="increase" data-id="${itemId}" data-quantity="${quantity}">+</button>
//                     </div>
//                     <span class="row-total">₹${rowTotal.toFixed(2)}</span>
//                 `;

//                 cartContainer.appendChild(listItem);
//             });

//             totalPriceElement.textContent = `Total: ₹${grandTotal.toFixed(2)}`;
//             checkoutButton.disabled = false;

//             document.querySelectorAll(".decrease").forEach(button => {
//                 button.addEventListener("click", () => {
//                     const currentQuantity = parseInt(button.dataset.quantity);
//                     if (currentQuantity === 1) {
//                         if (confirm("Do you want to remove this item from the cart?")) {
//                             updateQuantity(userId, button.dataset.id, 0);
//                         }
//                     } else {
//                         updateQuantity(userId, button.dataset.id, currentQuantity - 1);
//                     }
//                 });
//             });

//             document.querySelectorAll(".increase").forEach(button => {
//                 button.addEventListener("click", () => {
//                     updateQuantity(userId, button.dataset.id, parseInt(button.dataset.quantity) + 1);
//                 });
//             });

//         } catch (error) {
//             console.error("Error loading cart:", error);
//             alert("Failed to load cart. Please try again.");
//         }
//     }

//     async function updateQuantity(userId, itemId, newQuantity) {
//         try {
//             const itemRef = doc(db, `Users/${userId}/Cart`, itemId);

//             if (newQuantity < 1) {
//                 await deleteDoc(itemRef);
//             } else {
//                 await updateDoc(itemRef, { quantity: newQuantity });
//             }

//             loadCart();
//         } catch (error) {
//             console.error("Error updating quantity:", error);
//         }
//     }

//     async function proceedToCheckout() {
//         try {
//             const user = auth.currentUser;
//             if (!user) {
//                 alert("Please log in to proceed.");
//                 return;
//             }

//             const userId = user.uid;
//             const cartRef = collection(db, `Users/${userId}/Cart`);
//             const querySnapshot = await getDocs(cartRef);

//             if (querySnapshot.empty) {
//                 alert("Your cart is empty. Please add items before proceeding.");
//                 return;
//             }

//             let cartItems = [];
//             let totalAmount = 0;

//             querySnapshot.forEach((docSnap) => {
//                 const item = docSnap.data();
//                 const itemId = docSnap.id;
//                 const price = item.price || 0;
//                 const quantity = item.quantity || 1;
//                 const rowTotal = price * quantity;
//                 totalAmount += rowTotal;

//                 cartItems.push({
//                     id: itemId,
//                     name: item.name,
//                     price: price,
//                     quantity: quantity,
//                     rowTotal: rowTotal
//                 });
//             });
//  // ✅ Step 1: Get the Last Order ID
//  const ordersRef = collection(db, `Users/${userId}/Orders`);
//  const orderSnapshot = await getDocs(ordersRef);

//  let lastOrderNumber = 0;

//  orderSnapshot.forEach((docSnap) => {
//      const orderId = docSnap.id;
//      const match = orderId.match(/order_(\d+)/); // Extract number from order_XX
//      if (match) {
//          const num = parseInt(match[1]);
//          if (num > lastOrderNumber) {
//              lastOrderNumber = num;
//          }
//      }
//  });

//               // ✅ Step 2: Generate New Order ID
//         const newOrderNumber = (lastOrderNumber + 1).toString().padStart(2, '0'); // Format as 01, 02, etc.
//         const orderId = `order_${newOrderNumber}`;

//         // ✅ Step 3: Store Order in Firestore
//         const orderRef = doc(db, `Users/${userId}/Orders`, orderId);
//         await setDoc(orderRef, {
//             orderId: orderId,
//             items: cartItems,
//             totalAmount: totalAmount,
//             timestamp: new Date(),
//             status: "Pending", 
//             paymentMethod: "COD"
//         });

//         // ✅ Step 4: Clear Cart After Order Placement
//         querySnapshot.forEach(async (docSnap) => {
//             await deleteDoc(doc(db, `Users/${userId}/Cart`, docSnap.id));
//         });


//             window.location.href = "checkout.html";

//         } catch (error) {
//             console.error("Error processing checkout:", error);
//             alert("Failed to proceed to checkout. Please try again.");
//         }
//     }

//     document.getElementById("placeOrderButton").addEventListener("click", proceedToCheckout);

//     import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
//     onAuthStateChanged(auth, (user) => {
//         if (user) {
//             loadCart();
//         } else {
//             document.getElementById("cartItems").innerHTML = "<li>Please log in to view your cart.</li>";
//         }
//     });



