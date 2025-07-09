import {get} from'./services.js';
const url = "http://localhost:3000/users"

const routes = {
  "/home": "./home.html",   
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
  console.log("Ruta actual:", pathname);
console.log("Contenido cargado:", html);

  if(pathname == "/users") {
    setTimeout(renderUsers, 0);
  }
}

window.addEventListener("popstate", () =>
  navigate(location.pathname)
);

async function renderUsers() {

   let usersData = await get(url);
  const tbody = document.getElementById("userRows");

  let rows = "";
  usersData.forEach(user => {

    rows += `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${user.enrollNumber}</td>
      <td>${user.dateOfAdmission}</td>
    </tr> 
    `;
  });
     
 tbody.innerHTML += rows;

}

