async function addToCart(name) {
    await addToUserCart(name);
}

async function removeFromCart(name) {
    let el2 = document.getElementById(name + "-rem");
    if (userCart[name] === 1)
        removeAnimate(el2);
    await removeFromUserCart(name);
    setCartName();
}

async function deleteFromCart(name) {
    userCart[name] = 1;
    let el2 = document.getElementById(name + "-rem");
    removeAnimate(el2);
    await removeFromUserCart(name);
    setCartName();
}

async function loadCartItems(list, animate = false) {
    await loadCartNumber();
    if (!list && (!blurayList || blurayList.length == 0)) blurayList = await getBlurays();
    if (!list) list = blurayList;
    list = list.filter(i => Object.keys(userCart).includes(i.name));
    let el = document.getElementById("items-list");
    list.forEach(bluray => {
        el.innerHTML += `<div id="${bluray.name}-rem" class="panel-item list-item stylized" ${animate ? "style=\"transition: all ease 0.5s 0.5s; opacity: 0\"" : ""}>
        <div style="display: flex;width: 100%">
         <img src="${bluray.imageUrl}" style="height: 20em;width:auto;border-radius: 5px; box-shadow: 0 0 10px var(--background)"/>
         <div style="display:flex; flex-direction: column; margin-left:1em">
         <p class="title-text" style="font-size: 2em; ">${bluray.name}</p>
         <p style="margin-left:1em">${bluray.price}$ - (${bluray.stock} in stock)</p>
         <div style="display: flex;margin-left: 0.5em;">
         <p style="margin-left:0.5em">Amount: </p>
         <p style="margin-left: 0.5em" id="${bluray.name}-count">${userCart[bluray.name]}</p>
         </div>

       <div>
        <button class="shop-button" style="border: solid 1px var(--text-highlight)" onclick="addToCart('${bluray.name}')">
            +
        </button>
        <button class="shop-button" style="border: solid 1px var(--text-highlight)" onclick="removeFromCart('${bluray.name}')">
            -
        </button>
        <button class="shop-button" style="border: solid 1px var(--text-highlight)" onclick="deleteFromCart('${bluray.name}')">
            x
        </button>
        </div>
    </div>`;
    });
    if (animate)
        setTimeout(() =>
            document.querySelectorAll(".list-item").forEach(el => el.style.opacity = "1"), 100);
}


function setCartName() {
    let el = document.getElementById("cart-name");
    let el2 = document.getElementById("buy-panel");
    if (Object.keys(userCart).length === 0) {
        el.innerHTML = "Cart is empty! Please go to the <a href='shop.html'>shop page</a> to get some stuff!";
        el2.style.display = "none";
    } else {
        el.innerHTML = "Your Cart - Payment at the Bottom";
        el2.style.display = "";
    }
}

function showWire() {
    let wireEl = document.getElementById("div-wire");
    let cardEl = document.getElementById("div-card");
    wireEl.style.display = "flex";
    cardEl.style.display = "none";
}

function showCard() {
    let wireEl = document.getElementById("div-wire");
    let cardEl = document.getElementById("div-card");
    wireEl.style.display = "none";
    cardEl.style.display = "flex";
}

function purchaseCard() {
    let cardNumberEl = document.getElementById("card-number");
    let cardMonthEl = document.getElementById("card-month");
    let cardYearEl = document.getElementById("card-year");
    let cardCvcEl = document.getElementById("card-cvc");
    if (cardCvcEl.value.toString().length !== 3)
        return alert("Incorrect CVC, make sure it has 3 digits!");
    if (cardMonthEl.value.toString().length === 0)
        return alert("Please enter expiry month!");
    if (cardYearEl.value.toString().length !== 4)
        return alert("Please enter correct expiry year!");
    if (parseInt(cardYearEl.value.toString()) < new Date().getFullYear())
        return alert("Card is expired!");
    if (parseInt(cardNumberEl.value.toString()).toString().length !== 16)
        return alert("Please enter correct card number, 16 digits and just numbers!");
    clearCart();
}

function purchaseWire() {
    let fullName = document.getElementById("wire-name");
    let bankName = document.getElementById("wire-bank-name");
    let iban = document.getElementById("wire-iban");
    if (fullName.value.length === 0)
        return alert("Please enter your name");
    if (bankName.value.length === 0)
        return alert("Please enter your name");
    if (iban.value.length !== 26)
        return alert("Please enter your correct 26 digit iban without spaces");
    clearCart();
}


async function clearCart() {
    if (!localStorage.getItem("token"))
        alert("You should be logged in!");
    for (let item in userCart) {
        let bluray = blurayList.filter(i => i.name === item)[0];
        bluray.stock -= userCart[item];
    }
    let token = localStorage.getItem("token");
    await axios.delete("http://localhost:3000/cart", {headers: {authorization: "Bearer " + token}});
    localStorage.setItem("blurayList", JSON.stringify(blurayList));
    userCart = [];
    localStorage.removeItem("userCart");
    alert("Thank you for purchasing! Please visit us again!");
    location.reload();
}