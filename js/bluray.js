class Bluray {
    name;
    price;
    stock;
    imageUrl;

    constructor(name, price, stock, imageUrl) {
        this.name = name;
        this.price = price;
        this.stock = stock;
        this.imageUrl = imageUrl;
    }
}

let blurayList = [];
let blurayListJson = localStorage.getItem("blurayList");
if (blurayListJson) blurayList = JSON.parse(blurayListJson);
else blurayList = [];

async function addOrUpdateBluray(identifier) {
    let nameEl = document.getElementById("input-name" + (identifier ? "-" + identifier : ""));
    let name = nameEl.value;
    if (!name || name.length === 0) return alert("Please enter a name!");
    let priceEl = document.getElementById("input-price" + (identifier ? "-" + identifier : ""));
    let price = priceEl.value;
    let stockEl = document.getElementById("input-stock" + (identifier ? "-" + identifier : ""));
    let stock = stockEl.value;
    let imageEl = document.getElementById("input-image" + (identifier ? "-" + identifier : ""));
    let image = imageEl.value;
    let bluray = new Bluray(name, price, stock, image);
    if (identifier) {
        let pos = -1;
        for (let i = 0; i < blurayList.length; i++) if (blurayList[i].name === identifier) {
            pos = i;
            break;
        }
        bluray.id = blurayList[pos].id;
        blurayList.splice(pos, 1, bluray);
    } else {
        blurayList.push(bluray);
        loadItems([bluray], true);
    }
    localStorage.setItem("blurayList", JSON.stringify(blurayList));
    animate();
    let token = localStorage.getItem("token");
    bluray.price = Number(price);
    bluray.stock = Number(stock);
    await axios.post("http://localhost:3000/bluray", bluray, {headers: {authorization: "Bearer " + token}});
}

async function resetItems() {
    blurayList = [];
    localStorage.setItem("blurayList", JSON.stringify(blurayList));
    let elements = document.querySelectorAll(".list-item");
    for (let element of elements) {
        removeAnimate(element);
    }
    let token = localStorage.getItem("token");
    await axios.post("http://localhost:3000/bluray/reset", {}, {headers: {authorization: "Bearer " + token}});
    setTimeout(() => loadItems(null, true), 500);
}

function rerenderItem(name) {
    let nameEl = document.getElementById("input-name" + (name ? "-" + name : ""));
    let priceEl = document.getElementById("input-price" + (name ? "-" + name : ""));
    let stockEl = document.getElementById("input-stock" + (name ? "-" + name : ""));
    let imageEl = document.getElementById("input-image" + (name ? "-" + name : ""));
    let bluray = blurayList.filter(b => b.name === name)[0];
    nameEl.value = bluray.name;
    priceEl.value = bluray.price;
    stockEl.value = bluray.stock;
    imageEl.value = bluray.imageUrl;
}

async function deleteBluray(name) {
    for (let i = 0; i < blurayList.length; i++)
        if (blurayList[i].name === name) {
            let bluray = blurayList[i];
            blurayList.splice(i, 1);
            localStorage.setItem("blurayList", JSON.stringify(blurayList));
            let nameEl = document.getElementById("input-name" + (name ? "-" + name : ""));
            removeAnimate(nameEl.parentElement.parentElement);
            animate();
            let token = localStorage.getItem("token");
            await axios({
                method: "DELETE",
                url: "http://localhost:3000/bluray",
                data: {ids: [bluray.id]},
                headers: {authorization: "Bearer " + token},
            });
            break;
        }
    await loadCartNumber();
}

async function loadItems(list, animate = false) {
    if (!list) {
        blurayList = await getBlurays(true);
        list = blurayList;
    }
    let el = document.getElementById("items-list");
    list.forEach(bluray => {
        el.innerHTML += `<div class="panel-item list-item" ${animate ? "style=\"transition: all ease 0.5s 0.5s; opacity: 0\"" : ""}>
        <label>
            Name
            <input class="shop-input" id="input-name-${bluray.name}" value="${bluray.name}">
        </label>

        <label>
            Stock
            <input class="shop-input" id="input-stock-${bluray.name}" value="${bluray.stock}" type="number" min="0" style="width: 5em">
        </label>

        <label>
            Price
            <input class="shop-input" id="input-price-${bluray.name}" value="${bluray.price}" type="number" min="0" style="width: 5em">
        </label>

        <label>
            Image URL
            <input class="shop-input" id="input-image-${bluray.name}" value="${bluray.imageUrl}">
        </label>
        <button class="shop-button" onclick="deleteBluray('${bluray.name}')">
            Delete
        </button>
        <button class="shop-button" onclick="addOrUpdateBluray('${bluray.name}')">
            Save
        </button>
        <button class="shop-button" onclick="rerenderItem('${bluray.name}')">
            Reset
        </button>
    </div>`;
    });
    if (animate)
        setTimeout(() =>
            document.querySelectorAll(".list-item").forEach(el => el.style.opacity = "1"), 100);
}

function animate(ms) {
    let el = document.getElementById("changes-notif");
    el.style.opacity = "1";
    el.style["text-shadow"] = "0 0 50px var(--text)";
    setTimeout(() => {
        el.style.opacity = "0";
        el.style["text-shadow"] = "0 0 0 var(--text)";
    }, ms || 400);
}

function removeAnimate(element) {
    element.style.transition = "all 500ms";
    element.style.opacity = "0";
    element.style.transform = "scaleY(0)";
    element.style["max-height"] = "0";
    setTimeout(() => element.remove(), 500);
}

async function getBlurays(showAll = false) {
    let res = await axios.get("http://localhost:3000/bluray" + (showAll ? "?showAll=true" : ""));
    return res.data.result;
}