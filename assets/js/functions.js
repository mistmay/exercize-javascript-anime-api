let checkResult = true;

async function getRandomAnimes() {
    const randomAnimesArray = [];
    for (let i = 0; i < 20; i++) {
        try {
            const randomAnime = await fetch('https://api.jikan.moe/v4/random/anime');
            const randomAnimeJson = await randomAnime.json();
            randomAnimesArray.push(randomAnimeJson.data);
        } catch (error) {
            console.log(error);
        }
    }
    const uniqueArray = Array.from(new Set(randomAnimesArray.map(JSON.stringify))).map(JSON.parse);
    const result = [];
    uniqueArray.forEach(item => {
        let censure = false;
        item.genres.forEach(element => {
            if (element.name === 'Hentai' || element.name === 'Ecchi') {
                censure = true;
            }
        });
        if (!censure) {
            result.push(item);
        }
    });
    return result;
}

async function showMoreInfo(id) {
    document.getElementById('random-anime-bar').style.display = 'none';
    try {
        const currentAnime = await fetch(`https://api.jikan.moe/v4/anime/${id}`);
        const currentAnimesJson = await currentAnime.json();
        const section = document.createElement('section');
        section.setAttribute('class', 'w-100');
        section.id = 'current-anime';
        const div = document.createElement('div');
        div.setAttribute('class', 'w-100 bg-warning d-flex flex-column justify-content-between align-items-center gap-3 p-5');
        if (currentAnimesJson.data.images.jpg.image_url) {
            const img = document.createElement('img');
            img.setAttribute('src', currentAnimesJson.data.images.jpg.image_url);
            div.append(img);
        }
        const info = document.createElement('p');
        info.setAttribute('class', 'text-center fw-bold text-primary');
        info.innerText = `Japanese Title (Romanji): ${currentAnimesJson.data.title}\n
        English Title: ${currentAnimesJson.data.title_english}\n
        Japanese Title: ${currentAnimesJson.data.title_japanese}\n
        Number of Episodes: ${currentAnimesJson.data.episodes}\n
        Airing Status: ${currentAnimesJson.data.status}\n
        Rating: ${currentAnimesJson.data.rating}\n
        Year: ${currentAnimesJson.data.year}`;
        div.append(info);
        const genres = document.createElement('p');
        genres.setAttribute('class', 'text-center fw-bold text-primary');
        genres.innerText = 'Genres:';
        if (currentAnimesJson.data.genres.length === 0) {
            genres.innerText += ' unknown';
        } else {
            currentAnimesJson.data.genres.forEach(element => {
                genres.innerText += ` ${element.name}`;
            });
        }
        div.append(genres);
        if (currentAnimesJson.data.trailer.embed_url) {
            const video = document.createElement('iframe');
            video.setAttribute('width', '300');
            video.setAttribute('src', currentAnimesJson.data.trailer.embed_url);
            div.append(video);
        }
        const button = document.createElement('button');
        button.setAttribute('type', 'button');
        button.id = 'current-anime-btn';
        button.innerText = 'Back';
        div.append(button);
        section.append(div);
        document.querySelector('main').append(section);
        document.getElementById('current-anime-btn').addEventListener('click', () => {
            document.getElementById('random-anime-bar').style.display = 'block';
            document.getElementById('current-anime').remove();
        });
    } catch (error) {
        console.log(error);
    }
}

async function fetchSearch() {
    try {
        const searchedValue = document.querySelector('nav input').value.toLowerCase().trim();
        const searchedAnime = await fetch(`https://api.jikan.moe/v4/anime?q=${searchedValue}`);
        const searchedAnimeJson = await searchedAnime.json();
        return searchedAnimeJson.data;
    } catch (error) {
        console.log(error);
    }
}

export async function searchButton() {
    document.getElementById('random-anime-bar').style.display = 'block';
    if (document.getElementById('current-anime')) {
        document.getElementById('current-anime').remove();
    }
    document.querySelectorAll('.random-anime-card').forEach(element => {
        element.remove();
    });
    if (document.querySelector('#random-anime-bar>div>h2').classList.contains('mb-3')) {
        document.querySelector('#random-anime-bar>div>h2').classList.toggle('mb-3');
    }
    document.querySelector('#random-anime-bar>div>h2').innerText = 'Loading...';
    const callback = fetchSearch();
    try {
        await InitPage(callback);
    } catch (error) {
        console.log(error);
    }
    if (checkResult) {
        document.querySelector('#random-anime-bar>div>h2').innerText = 'Results:';
    } else {
        document.querySelector('#random-anime-bar>div>h2').innerText = 'No results';
    }
}

export async function InitPage(fetchFunction = getRandomAnimes()) {
    try {
        const randomAnimesArray = await fetchFunction;
        if (randomAnimesArray.length === 0) {
            checkResult = false;
        } else {
            checkResult = true;
            document.querySelector('#random-anime-bar>div>h2').innerText = 'Random Animes:';
            document.querySelector('#random-anime-bar>div>h2').classList.toggle('mb-3');
            randomAnimesArray.forEach(element => {
                const card = document.createElement('div');
                card.setAttribute('class', 'random-anime-card col-12 col-sm-6 col-md-3 d-flex flex-column justify-content-between align-items-center');
                if (element.images.jpg.large_image_url) {
                    const img = document.createElement('img');
                    img.setAttribute('src', element.images.jpg.large_image_url);
                    card.append(img);
                }
                const title = document.createElement('h3');
                title.setAttribute('class', 'w-100 text-center mt-2 fw-bold');
                title.innerText = `Title: ${element.title}`;
                card.append(title);
                const genre = document.createElement('p');
                genre.setAttribute('class', 'w-100 text-center mt-2 fw-bold');
                if (element.genres[0]) {
                    const firstGenre = element.genres[0];
                    genre.innerText = `Genre: ${firstGenre.name}`;
                } else {
                    genre.innerText = 'Genre: Unknown';
                }
                card.append(genre);
                const button = document.createElement('button');
                button.setAttribute('type', 'button');
                button.setAttribute('class', 'mt-2 w-100 random-anime-card-btn');
                button.id = String(element.mal_id);
                button.innerText = 'More info';
                card.append(button);
                document.querySelector('#random-anime-bar .row').append(card);
            });
            document.querySelectorAll('.random-anime-card-btn').forEach(element => {
                element.addEventListener('click', () => showMoreInfo(Number(element.id)));
            });
        }
    } catch (error) {
        console.log(error);
    }
}