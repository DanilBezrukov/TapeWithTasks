// Получаем все элементы
const btns = document.querySelectorAll(".btn")
const container = document.querySelector(".container")
const sorting = document.querySelector("#sorting")
const numberPosts = document.querySelector("#numberPosts")
const pagination = document.querySelector('#pagination');

// Получаем данные из localStorage 
if (localStorage.getItem("sorting")) {
    sorting.value = localStorage.getItem("sorting")
}
if (localStorage.getItem("numberPosts")) {
    numberPosts.value = localStorage.getItem("numberPosts")
}
if (Boolean(localStorage.getItem("Layout"))) {
    const i = +localStorage.getItem("Layout")
    btns[i].classList.add("activeLayout")
    btns[Math.abs(i - 1)].classList.remove("activeLayout")
    container.dataset.display = i
}
let numActivPage = +localStorage.getItem("activPage") || 1

// Функция для отправки GET-запроса на сервер
function sendRequest() {
    const url = "https://jsonplaceholder.typicode.com/todos"
    return fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" }
    }).then((response) => {
        if (response.ok) {
            return response.json()
        }
        return response.json().then(error => {
            const e = new Error("Что-то пошло не так")
            e.data = error
            throw e
        })
    })
}

// Вызываем функцию и обрабатываем полученные данные
sendRequest()
    .then(data => {
        createResponseProcessing(data)
        createPagination(data, numberPosts.value);
        showPage(numActivPage, data, numberPosts.value);
        sorting.addEventListener("change", () => {
            container.innerHTML = ""
            createPagination(data, numberPosts.value);
            showPage(numActivPage, data, numberPosts.value);
            localStorage.setItem("sorting", sorting.value)
        })
        numberPosts.addEventListener("change", () => {
            container.innerHTML = ""
            numActivPage = 1
            createPagination(data, numberPosts.value);
            showPage(numActivPage, data, numberPosts.value);
            localStorage.setItem("numberPosts", numberPosts.value)
        })
    })
    .catch(err => {
        console.error(err);
        alert("Что-то пошло не так при загрузке данных. Попробуйте позже");
    });

//Получение данных, фильтрация и передаем в другие функции для обработки
function createResponseProcessing(data) {
    const arr = getRequiredPosts(data)
    const sortingArr = getSortingPost(arr)
    createPostOutput(sortingArr)
}

//Принимает объект и возвращает новый массив с "задачей" и ее выполнением
//соответствующий количеству постов, указанных в поле "Кол-во:"
function getRequiredPosts(data) {
    return data.slice(0, numberPosts.value).map(post => [post.title, post.completed]);
}

//возвращает отсортированный массив в зависимости от значения, выбранного в выпадающем списке.
function getSortingPost(arr) {
    if (sorting.value == "all") return arr
    const arrCompleted = arr.filter(post => post[1]);
    const arrNotCompleted = arr.filter(post => !post[1]);
    return arrNotCompleted.concat(arrCompleted)
}

//создает HTML-элементы для каждого поста
function createPostOutput(arr) {
    arr.forEach(([title, completed]) => {
        const post = document.createElement("div");
        const content = document.createElement("p");
        const state = document.createElement("p");
        content.textContent = title[0].toUpperCase() + title.slice(1);
        if (completed) {
            state.style.color = "#32CD32"
            state.textContent = "Выполнено"
        } else {
            state.style.color = "#FF0000"
            state.textContent = "Не выполнено"
        }
        post.appendChild(content);
        post.appendChild(state);
        container.appendChild(post);
    });
}

// Вешаем обработчик событий на кнопки "Вид" 
for (b of btns) {
    b.addEventListener('click', showLayot)
}

// Добавляем класс к кнопкам "Вид"
// изменяем dataset и локальное хранилище для хранения текущего вида,
// и затем удаляет классс другой кнопоки
function showLayot() {
    this.classList.add("activeLayout")
    for (let i = 0; i < 2; i++) {

        if (btns[i] === this) {
            container.dataset.display = i
            localStorage.setItem("Layout", i)
        } else {
            btns[i].classList.remove("activeLayout")
        }
    }
}

// Создаем пагинацию на основе данных и количества записей на странице
// устанавливает активную страницу и добавляет обработчик событий на остальные элементы
function createPagination(data, numberPosts) {
    pagination.innerHTML = ""
    const totalPages = Math.ceil(data.length / numberPosts);
    let activPage
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement("li");
        li.innerText = +i;
        if (li.innerText == numActivPage) {
            li.classList.add("active")
        }
        li.addEventListener("click", (event) => {
            const list = pagination.querySelectorAll('li')
            for (let i = 0; i < list.length; i++) {
                list[i].classList.remove('active')
            }
            event.target.classList.add("active")
            activPage = event.target
            showPage(i, data, numberPosts);
        });
        pagination.appendChild(li);
    }
}

// Показываем страницу, устанавливая номер активной и срез данных в соответствии с этой страницей
// Вызывает функцию, чтобы отобразить записи
function showPage(page, data, numberPosts) {
    numActivPage = page
    localStorage.setItem("activPage", page)
    const start = (page - 1) * numberPosts;
    const end = start + numberPosts;
    const pageData = data.slice(start, +end);
    container.innerHTML = "";
    createResponseProcessing(pageData)
}