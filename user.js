// user.js

async function fetchUserInfo(username) {
    const response = await fetch(`https://repository-viewer-one.vercel.app/user/${username}`);
    if (response.ok) {
        return await response.json();
    } else {
        console.error(`Error fetching user info for ${username}`);
        return {};
    }
}

async function fetchRepositories(username, page) {

    const loader = document.getElementById('loader');
    loader.style.display = 'block'; // Show loader before fetching data
const data = {
    username,
    page
}
    const response = await fetch('https://repository-viewer-one.vercel.app/repositories', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const data = await response.json();
        displayPagination(data.totalPages, page);
        await displayRepositories(data.repositories);
        // displayPagination(data.totalPages);
    } else {
        alert('Error fetching repositories');
    }
}

async function displayRepositories(repositories) {
    const repositoriesList = document.getElementById('repositories');
    repositoriesList.innerHTML = '';
    console.log(repositories)

    for (const repo of repositories) {
        const item = document.createElement('div');
        item.className = 'repository';

        const languages = await fetchLanguages(repo.owner.login, repo.name);
        console.log(languages)

        item.innerHTML = `
            <a href=${repo?.html_url}> ${repo?.name}</a>
            <p>${repo?.description || 'No description available'}</p>
            <div class="language-container">${Object.keys(languages).map(language => `<span class="language">${language}</span>`).join(' ')}</div>
        `;

        repositoriesList.appendChild(item);
    }
    loader.style.display = 'none';
}

async function fetchLanguages(owner, repo) {
    try {
        const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/languages`);
        const data = await response.json();
        return data;
    } catch (error) {
        console.error(`Error fetching languages for ${owner}/${repo}:`, error);
        return {};
    }
}


function displayPagination(totalPages, currentPage) {
    const paginationContainer = document.getElementById('pagination');
    paginationContainer.innerHTML = '';

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement('button');
        button.textContent = i;
        button.className = 'pagination-button';

        if (i === currentPage) {
            button.classList.add('active'); // Add the active class to the current page
        }

        button.onclick = () => {
            fetchRepositoriesWithPage(i);
        };

        paginationContainer.appendChild(button);
    }
}


async function fetchRepositoriesWithPage(page) {
    const username = new URLSearchParams(window.location.search).get('username');
    await fetchRepositories(username, page);
}

// Fetch user information and repositories on page load
document.addEventListener('DOMContentLoaded', async () => {
    const username = new URLSearchParams(window.location.search).get('username');
    

    // Fetch user info
    const userInfo = await fetchUserInfo(username);
    console.log(userInfo)

    // Update user information section
    const userAvatar = document.getElementById('user-avatar');
    userAvatar.src = userInfo?.avatar_url;

    const userName = document.getElementById('name');
    userName.textContent = userInfo?.name || username;

    const userBio = document.getElementById('user-bio');
    userBio.textContent = userInfo?.bio || 'No bio available';

    const location = document.getElementById('location');
    location.textContent = userInfo?.location || 'Location Not available';


    const githubLink = document.getElementById('github-link');
    githubLink.textContent = userInfo?.url;



    // Fetch and display repositories
    const currentPage = 1; // You can get the current page from your URL parameters
    await fetchRepositories(username, currentPage);
    
});
