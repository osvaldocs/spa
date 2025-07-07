import {get} from'./services.js';

const routes = {
  "/": "./users.html",   
  "/users": "./users.html",
  "/newuser": "./newuser.html",
  "/about": "./about.html",
};

document.body.addEventListener("click", (e) => {
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});

async function navigate(pathname) {
  const route = routes[pathname];
  const html = await fetch(route).then((res) => res.text());
  document.getElementById("content").innerHTML = html;
  history.pushState({}, "", pathname);
}

window.addEventListener("popstate", () =>
  navigate(location.pathname)
);


console.log(await get("http://localhost:3000/users"));

const user1 = document.getElementById("userList");

const usersArray = await get("http://localhost:3000/users");

function showUsers() {
  usersArray.forEach(obj => {
    const divContainer = document.createElement("div");
    divContainer.classList.add("user-card");

    divContainer.innerHTML += `
    <h3>${obj.name}</h3>
    <p>${obj.email}</p>
    <p>${obj.enrollNumber}</p>
    <p>${obj.dateOfAdmission}</p>
    `
    user1.appendChild(divContainer);
  });
}
