const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const MOVIES_PER_PAGE = 12;
const paginationPanel = document.querySelector("#paginator");
const cardlistStyle = document.querySelector("#card-list-style");
const movies = [];
let filteredMovies = [];
let nowPage = 1; //設定所有初始頁面
//監聽 card 與 list
cardlistStyle.addEventListener("click", onCardorListStyle);
//增加 當按下card 與 list 按鈕的條件
function onCardorListStyle(event) {
  if (event.target.matches(".fa-th")) {
    renderMovieList(getMoviesByPage(nowPage));
  } else if (event.target.matches(".fa-bars")) {
    renderMovieList2(getMoviesByPage(nowPage));
  }
}

function renderMovieList(datas) {
  let rawHTML = "";
  datas.forEach(function print(data) {
    rawHTML += `<div class="col-sm-3">
    <div class="mb-2">
      <div class="card">
        <img
          src="${POSTER_URL + data.image}"
          class="card-img-top" alt="Movie Poster" />
        <div class="card-body">
          <h5 class="card-title">${data.title}</h5>
        </div>
        <div class="card-footer">
          <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id
      }">More</button>
          <button class="btn btn-info btn-add-favorite" data-id="${data.id
      }">+</button>
        </div>
      </div>
    </div>
  </div>`;
  });
  dataPanel.innerHTML = rawHTML;
}
//加入 list 的HTML樣式 function
function renderMovieList2(datas) {
  let rawHTML = "";
  rawHTML += `<ul class="list-group list-group-flush">`;
  datas.forEach(function print(data) {
    rawHTML += `<li class="list-group-item" style="position: relative;">${data.title}
    <span style="position: absolute; right: 100px; top: 1px;">
    <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal" data-bs-target="#movie-modal" data-id="${data.id}">More</button>
                 <button class="btn btn-info btn-add-favorite" data-id="${data.id}">+</button>
                 </span>
               </li>`;
  });
  rawHTML += `</ul>`;
  dataPanel.innerHTML = rawHTML;
}
//開始的初始畫面為card
axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage(1));
  })
  .catch((err) => console.log(err));

paginationPanel.addEventListener("click", onPaginatorClicked);

//加入條件，不管在各自list 或 card 的情境下，都能單獨進行各自的分頁內容變換
function onPaginatorClicked(event) {
  nowPage = Number(event.target.dataset.page); // 更改為可修改變數
  //原先為 const page = Number(event.target.dataset.page)
  const tagNameUL =
    event.target.parentElement.parentElement.parentElement
      .previousElementSibling.children[0].tagName;
  if (tagNameUL === "UL") {
    renderMovieList2(getMoviesByPage(nowPage));
  } else {
    renderMovieList(getMoviesByPage(nowPage));
  }
}

function getMoviesByPage(page) {
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function renderPaginator(amount) {
  const numberOfPages = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`;
  }
  paginationPanel.innerHTML = rawHTML;
}

dataPanel.addEventListener("click", onPanelClicked);

function onPanelClicked(event) {
  if (event.target.matches(".btn-show-movie")) {
    showMovieModal(event.target.dataset.id);
  } else if (event.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(event.target.dataset.id));
  }
}

function showMovieModal(id) {
  const modalTitle = document.querySelector("#movie-modal-title");
  const modalImage = document.querySelector("#movie-modal-image");
  const modalDate = document.querySelector("#movie-modal-date");
  const modalDescription = document.querySelector("#movie-modal-description");
  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data.results;
    modalTitle.innerText = data.title;
    modalDate.innerText = "Release date: " + data.release_date;
    modalDescription.innerText = data.description;
    modalImage.innerHTML = `<img src="${POSTER_URL + data.image
      }" alt="movie-poster" class="img-fluid">`;
  });
}

function addToFavorite(id) {
  function isMovie(movie) {
    return movie.id === id;
  }

  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find(isMovie);
  if (list.some((movie) => movie.id === id)) {
    return alert("此電影已經在收藏清單中！");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

searchForm.addEventListener("submit", onSearchFormSubmitted);

function onSearchFormSubmitted(event) {
  event.preventDefault();
  const keyword = searchInput.value.trim().toLowerCase();

  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的電影`);
  }

  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage(1));
}
