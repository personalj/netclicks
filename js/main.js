const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';

const leftMenu = document.querySelector('.left-menu'),
      hamburger = document.querySelector('.hamburger'),
      tvShowList = document.querySelector('.tv-shows__list'),
      modal = document.querySelector('.modal'),
      tvShows = document.querySelector('.tv-shows'),
      tvCardImg = document.querySelector('.tv-card__img'),
      modalTitle =  document.querySelector('.modal__title'),
      genresList = document.querySelector('.genres-list'),
      rating = document.querySelector('.rating'),
      description = document.querySelector('.description'),
      modalLink = document.querySelector('.modal__link'),
      searchForm = document.querySelector('.search__form'),
      searchFormInput =  document.querySelector('.search__form-input'),
      preloader = document.querySelector('.preloader'),
      dropdown = document.querySelectorAll('.dropdown'),
      tvShowsHead = document.querySelector('.tv-shows__head'),
      posterWrapper = document.querySelector('.poster__wrapper'),
      modalContent = document.querySelector('.modal__content'),
      pagination = document.querySelector('.pagination');
const loading = document.createElement('div');
loading.className = 'loading';
const DBService = class {
    constructor() {
        this.SERVER  = 'https://api.themoviedb.org/3';
        this.API_KEY = 'ee0fd8d418b593d67d9abeb189204d67';
    }
    getData = async (url) => {
        tvShowList.append(loading);
        const res = await fetch(url);
        if(res.ok) {
            return res.json();
        }else {
            throw new Error(`Не удалось получить данные по адресу ${url}`)
        }
    }
    getTestData =  () => {
        return this.getData('test.json');
    }

    getTestCard = () => {
        return this.getData('card.json');
    }
    getSearchResult = query => {
        this.temp = `${this.SERVER}/search/tv?api_key=${this.API_KEY}&query=${query}&language=ru-RU`;
        return this.getData(this.temp);
    }
    getNextPage = page => {
        return this.getData(this.temp + '&page=' + page);
    }
    getTvShow = id => {
        return this.getData(`${this.SERVER}/tv/${id}?api_key=${this.API_KEY}&language=ru-RU`);
    }
    getTopRated = () => this.getData(`${this.SERVER}/tv/top_rated?api_key=${this.API_KEY}&language=ru-RU`);
    getPopular = () => this.getData(`${this.SERVER}/tv/popular?api_key=${this.API_KEY}&language=ru-RU`);
    getToday = () => this.getData(`${this.SERVER}/tv/airing_today?api_key=${this.API_KEY}&language=ru-RU`);
    getWeek = () => this.getData(`${this.SERVER}/tv/on_the_air?api_key=${this.API_KEY}&language=ru-RU`);
}

const dbService = new DBService();

const renderCard = (response, target) => {
    tvShowList.textContent = '';
    if(!response.total_results) {
        loading.remove();
        tvShowsHead.textContent = 'К сожалению по Вашему запросу ничего не найдено...';
        tvShowsHead.style.cssText = 'color: red; ';
        return
    }
    tvShowsHead.textContent = target ? target.textContent : 'Результат поиска...';
    tvShowsHead.style.cssText = 'color: black; ';
    response.results.forEach(item => {
        const { backdrop_path: backdrop, 
            name: title, 
            poster_path: poster, 
            vote_average: vote,
            id
         } = item;
         const posterImg = poster ? IMG_URL + poster : 'img/no-poster.jpg' ;
         const backdropImg = backdrop ? IMG_URL + backdrop : '';
         const voteElem = vote ? ` <span class="tv-card__vote">${vote}</span>` : '';
        
        const card = document.createElement('li');
        // card.idTV = id;
        card.classList.add('tv-shows__item');
        card.innerHTML = `
            <a href="#" id="${id}" class="tv-card">
                ${voteElem}
                <img class="tv-card__img"
                    src="${posterImg}"
                    data-backdrop="${backdropImg}"
                    alt="${posterImg}">
                <h4 class="tv-card__head">${title}</h4>
            </a>
        `;
        loading.remove();
        tvShowList.append(card)
    });
    pagination.textContent = '';
    if(!target && response.total_pages > 1) {
        for(let i = 1; i <= response.total_pages; i++){
            pagination.innerHTML += `<li><a href="#" class="pages">${i}</a></li>`
        }
    }
}
searchForm.addEventListener('submit', event => {
    event.preventDefault();
    const value = searchFormInput.value.trim();
    if(value) {
        dbService.getSearchResult(value).then(renderCard);
    }
    searchFormInput.value = '';
    
});
// {
//     tvShowList.append(loading);
//     new DBService().getTestData().then(renderCard);
// }
const closeDropDown = () => {
    dropdown.forEach(item => {
        item.classList.remove('active');
    })
};
hamburger.addEventListener('click', () => {
    leftMenu.classList.toggle('openMenu');
    hamburger.classList.toggle('open');
    closeDropDown();
});

document.addEventListener('click', event => {
    const target = event.target;
    if(!target.closest('.left-menu')) {
        leftMenu.classList.remove('openMenu');
        hamburger.classList.remove('open');
    }
});

leftMenu.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const dropdown = target.closest('.dropdown');

    if(dropdown) {
        dropdown.classList.toggle('active');
        leftMenu.classList.add('openMenu');
        hamburger.classList.add('open');
    }
    if(target.closest('#top-rated')) {
        dbService.getTopRated().then((response) => renderCard(response, target));
    }
    if(target.closest('#popular')) {
        dbService.getPopular().then((response) => renderCard(response, target));
    }
    if(target.closest('#week')) {
        dbService.getToday().then((response) => renderCard(response, target));
    }
    if(target.closest('#today')) {
        dbService.getWeek().then((response) => renderCard(response, target));
    }
    if(target.closest('#search')) {
        tvShowList.textContent = '';
        tvShowsHead.textContent = '';
    }
});

tvShowList.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    const card = target.closest('.tv-card');

    if(card) {
        preloader.style.display = 'block';
        dbService.getTvShow(card.id)
            .then(data => {
                if(data.poster_path) {
                    tvCardImg.src = IMG_URL + data.poster_path;
                    tvCardImg.alt = data.name;
                    posterWrapper.style.display = '';
                    modalContent.style.paddingLeft = '';
                    loading.remove();
                }else {
                    posterWrapper.style.display = 'none';
                    modalContent.style.paddingLeft = '25px';
                }
                
                modalTitle.textContent = data.name;
                // genresList.innerHTML = data.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`, '');
                genresList.textContent = '';
                for(const item of data.genres) {
                    genresList.innerHTML += `<li>${item.name}</li>`;
                }
                rating.textContent = data.vote_average;
                description.textContent = data.overview;
                modalLink.href = data.homepage;
            })
            .then(() => {
                document.body.style.overflow = 'hidden';
                modal.classList.remove('hide');
            })
            .finally(() => {
                preloader.style.display = '';
            })
    }
});
modal.addEventListener('click', event => {
    // event.preventDefault();
    if(event.target.closest('.cross') || event.target.classList.contains('modal')) {
        document.body.style.overflow = '';
        modal.classList.add('hide');
    }
});
const changeImage = event => {
    const card = event.target.closest('.tv-shows__item');
    if(card) {
        const img = card.querySelector('.tv-card__img');
        const changeImage = img.dataset.backdrop;
        if(changeImage) {
            img.dataset.backdrop = img.src;
            img.src = changeImage;
        }
      
    }
};
tvShowList.addEventListener('mouseover', changeImage);
tvShowList.addEventListener('mouseout', changeImage);

pagination.addEventListener('click', event => {
    event.preventDefault();
    const target = event.target;
    if(target.classList.contains('pages')) {
        tvShows.append(loading);
        dbService.getNextPage(target.textContent).then(renderCard);
    }
});