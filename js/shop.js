let userCart = {};
let userCartJson = localStorage.getItem("userCart");
if (userCartJson) userCart = JSON.parse(userCartJson);

async function addToUserCart(name) {
    if (blurayList.filter(b => b.name === name)[0].stock <= userCart[name]) return alert("No more available in stock, sorry!");
    if (!userCart[name]) userCart[name] = 1; else userCart[name]++;
    localStorage.setItem("userCart", JSON.stringify(userCart));
    let el = document.getElementById(name + "-count");
    let el2 = document.getElementById(name + "-rem");
    el.innerText++;
    el.style.opacity = "1";
    el2.style.opacity = "1";
    let token = localStorage.getItem("token");
    if (token) {
        await axios.post("http://localhost:3000/cart", {
            blurayName: name,
            count: userCart[name],
        }, {headers: {authorization: "Bearer " + token}});
    }
    await loadCartNumber();
}

async function removeFromUserCart(name) {
    let el = document.getElementById(name + "-count");
    let el2 = document.getElementById(name + "-rem");
    if (userCart[name] > 1) {
        userCart[name]--;
        el.innerText--;
    } else {
        delete userCart[name];
        el.innerText = "0";
        el.style.opacity = "0";
        el2.style.opacity = "0";
    }
    localStorage.setItem("userCart", JSON.stringify(userCart));
    let token = localStorage.getItem("token");
    if (token) {
        await axios.post("http://localhost:3000/cart", {
            blurayName: name,
            count: userCart[name] || 0,
        }, {headers: {authorization: "Bearer " + token}});
    }
    await loadCartNumber();
}
async function getCart(){
    let token = localStorage.getItem("token");
    if (token) {
        let res = await axios.get("http://localhost:3000/cart", {headers: {authorization: "Bearer " + token}});
        userCart = {};
        for (let item of res.data) {
            userCart[item.bluray.name] = item.count;
        }
        localStorage.setItem("userCart", JSON.stringify(userCart));
    }
}
async function loadCartNumber() {
    await getCart();
    let i = 0;
    for (let cartItem in userCart) {
        i += userCart[cartItem];
    }
    let el = document.querySelector("#cart-link");
    if (i > 0) el.innerHTML = "Cart [" + i + "]"; else el.innerHTML = "Cart";
}

async function loadShopItems() {
    await loadCartNumber();
    blurayList = (await axios.get("http://localhost:3000/bluray")).data.result;
    let listEl = document.querySelector(".items-list");
    blurayList.forEach(bluray => {
        listEl.innerHTML += `
        <div class="shop-item">
            <img class="poster-image"
                 src="${bluray.imageUrl}"
                 alt="">
            <div class="shop-item-bar">
                <p class="text-no-margin title-text">${bluray.name}</p>
                <div style="flex:1"></div>
                <div class="shop-item-stock-cart">
                    <p class="text-no-margin shop-item-text-small" style="text-align: end; width: 10em; font-size: 0.6em">(${bluray.price}$) ${bluray.stock} available</p>
                    <div style="display: flex; align-items: center">
                        <button class="shop-button" id="${bluray.name}-rem" onclick="removeFromUserCart('${bluray.name}')" style="border-radius: 5px;width:min-content;transition: all 0.5s; ${userCart[bluray.name] ? "opacity:1" : "opacity:0"}">-</button>
                        <p class="text-no-margin" id="${bluray.name}-count" style="font-size: 0.6em; transition: all 0.5s; ${userCart[bluray.name] ? "opacity:1" : "opacity:0"}">${userCart[bluray.name] || 0}</p>
                        <button class="shop-button" onclick="addToUserCart('${bluray.name}')">Add to cart</button>
                    </div>
                </div>
            </div>
        </div>
        `;
    });
}