import {get, post, deletes} from'./services.js';
const url = "http://localhost:3000/users"

const routes = {
  "/home": "./home.html",   
  "/users": "./users.html",
  "/newuser": "./newuser.html",
  "/about": "./about.html",
  "/edit": "./ediUser.html"
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
  } else if (pathname === "/newuser") {
    setTimeout(setupForm, 0);
  } else if (pathname === "/edit") {
    setTimeout(editUser, 0);
  }

}
 

window.addEventListener("popstate", () =>
  navigate(location.pathname)
);

async function renderUsers() {

   let usersData = await get(url);
  const tbody = document.getElementById("userRows");
  
  tbody.innerHTML = "";
  let rows = "";
  usersData.forEach(user => {

    rows += `
    <tr>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${user.enrollNumber}</td>
      <td>${user.dateOfAdmission}</td>
      <td>
        <button class="editUser-button" id="${user.id}>
          <a href="/editUser">Edit User</a>
        </button>
      </td>
       <td>
        <button class="deleteUser-button" id=${user.id}>Delete User</button>
      </td>   
    </tr> 
    `;
  });
     
 tbody.innerHTML += rows;


  let buttons = document.querySelectorAll(".deleteUser-button")
  buttons.forEach(btn => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      let id = btn.id;
      let deleteUser = await deletes(url, id)
      if(deleteUser) {
        alert("User correctly deleted.");
        renderUsers();
      } else {
        alert("An error ocurred while try delete.");
      }
    })
  })
}


async function setupForm() {
  const form = document.querySelector(".form-container");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    let count = await get(url);

    const newUser = {
      "id": String(count.length),
      "name": form.name.value.trim(),
      "email": form.email.value.trim(),
      "phone": form.phone.value.trim(),
      "enrollNumber": form.enrollNumber.value.trim(),
      "dateOfAdmission": form.dateOfAdmission.value.trim()
    };

    try {
    await post(url, newUser);
    alert("User successfully saved.");
    form.reset();
  } catch (err) {
    console.error("Error at save:", err);
    alert("An error occurred while saving the user.");
  }

  })
}

async function editUser() {

}
