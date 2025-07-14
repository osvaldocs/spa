// Importo las funciones del servicio para interactuar con la API (GET, POST, DELETE, PUT)
import { get, post, deletes, update } from './services.js';

const url = "http://localhost:3000/users";
let currentUser = null;

// Defino las rutas del SPA (Single Page Application)
const routes = {
  "/home": "./home.html",   
  "/users": "./users.html",
  "/newuser": "./newuser.html",
  "/about": "./about.html",
  "/edit": "./editUser.html",
  "/login": "./login.html"
};

// Manejo la navegación sin recargar la página
document.body.addEventListener("click", (e) => {  
  if (e.target.matches("[data-link]")) {
    e.preventDefault();
    navigate(e.target.getAttribute("href"));
  }
});

// Función principal de navegación
async function navigate(pathnameWithQuery) {
  const urlObj = new URL(pathnameWithQuery, window.location.origin);
  const pathname = urlObj.pathname;
  const route = routes[pathname];
  const user = JSON.parse(sessionStorage.getItem("loggedUser")); // Recupero el usuario logueado

  if (!route) {
    console.error("Ruta no encontrada:", pathname);
    return;
  }

  const html = await fetch(route).then((res) => res.text());
  document.getElementById("content").innerHTML = html;
  history.pushState({}, "", pathnameWithQuery);
  renderSidebarUser();

  // Protejo la vista /users para que solo sea accesible si hay un usuario logueado
  if (pathname === "/users") {
    if (!user) {
      alert("Debes iniciar sesión para ver esta página.");
      return navigate("/login");
    }
    setTimeout(renderUsers, 0);

  // Solo el rol admin puede acceder al formulario para crear nuevos usuarios
  } else if (pathname === "/newuser") {
    if (!user || user.role !== "admin") {
      alert("Acceso denegado. Solo administradores.");
      return navigate("/home");
    }
    setTimeout(setupForm, 0);

  // Solo admin puede editar usuarios
  } else if (pathname === "/edit") {
    if (!user || user.role !== "admin") {
      alert("Acceso denegado. Solo administradores.");
      return navigate("/home");
    }
    const id = urlObj.searchParams.get("id");
    setTimeout(() => editUser(id), 0);

  } else if (pathname === "/login") {
    setTimeout(setupLogin, 0);
  }
}

// Cierro la sesión y redirijo al login
document.addEventListener("click", (e) => {
  if (e.target.id === "logout") {
    const confirmed = confirm("¿Estás seguro de que querés cerrar sesión?");
    if (!confirmed) return;

    sessionStorage.removeItem("loggedUser");
    alert("Sesión cerrada.");
    navigate("/login"); 
  }
});

// Manejo el botón "Atrás" del navegador
window.addEventListener("popstate", () =>
  navigate(location.pathname)
);

// Renderizo la tabla de usuarios, controlando qué botones ve cada rol
async function renderUsers() {
  console.log("Ejecutando renderUsers");

  currentUser = JSON.parse(sessionStorage.getItem("loggedUser"));
  if (!currentUser) {
    alert("Debes iniciar sesión para ver esta página.");
    return navigate("/login");
  }

  // Oculto el botón de "Agregar estudiante" si no es admin
  const newUserBtn = document.getElementById("newUser-button");
  if (newUserBtn && currentUser.role !== "admin") {
    newUserBtn.style.display = "none";
  }

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
          ${currentUser.role === "admin" 
            ? `<a class="editUser-button" href="/edit?id=${user.id}" data-link>Editar</a>` 
            : `--`}
        </td>
        <td>
          ${currentUser.role === "admin" 
            ? `<button class="deleteUser-button" id="${user.id}">Eliminar</button>` 
            : `--`}
        </td>
      </tr>`;
  });

  tbody.innerHTML += rows;

  // Solo los admin pueden eliminar usuarios
  if (currentUser.role === "admin") {
    let buttons = document.querySelectorAll(".deleteUser-button");
    buttons.forEach(btn => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const id = btn.id;
        const confirmed = confirm("¿Estás seguro de que querés eliminar al usuario?");
        if (!confirmed) return;
        const deleteUser = await deletes(url, id);
        if (deleteUser) {
          alert("Usuario eliminado correctamente.");
          renderUsers();
        } else {
          alert("Ocurrió un error al intentar eliminar.");
        }
      });
    });
  }
}

// Formulario para crear nuevo usuario
async function setupForm() {
  const form = document.querySelector(".form-container");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newUser = {
      "name": form.name.value.trim(),
      "email": form.email.value.trim(),
      "phone": form.phone.value.trim(),
      "enrollNumber": form.enrollNumber.value.trim(),
      "dateOfAdmission": form.dateOfAdmission.value.trim(),
      "password": form.password.value.trim()
    };

    try {
      await post(url, newUser);
      alert("Usuario guardado exitosamente.");
      form.reset();
    } catch (err) {
      console.error("Error al guardar:", err);
      alert("Ocurrió un error al guardar el usuario.");
    }
  });
}

// Formulario para editar usuario (solo admin)
async function editUser(id) {
  const form = document.querySelector(".form-container");

  try {
    const user = await get(`${url}/${id}`);

    form.name.value = user.name;
    form.email.value = user.email;
    form.phone.value = user.phone;
    form.enrollNumber.value = user.enrollNumber;
    form.dateOfAdmission.value = user.dateOfAdmission;
    form.password.value = user.password;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedUser = {
        "name": form.name.value.trim(),
        "email": form.email.value.trim(),
        "phone": form.phone.value.trim(),
        "enrollNumber": form.enrollNumber.value.trim(),
        "dateOfAdmission": form.dateOfAdmission.value.trim(),
        "password": form.password.value.trim()
      };

      try {
        await update(url, id, updatedUser);
        alert("Usuario actualizado correctamente.");
        history.pushState({}, "", "/users");
        navigate("/users");
      } catch (err) {
        console.error("Error al actualizar usuario:", err);
        alert("Ocurrió un error al actualizar.");
      }
    });

  } catch (err) {
    console.error("Error al cargar usuario:", err);
    alert("Usuario no encontrado.");
  }
}

// Lógica del login (verifica si el email y contraseña existen)
async function setupLogin() {
  const form = document.querySelector(".form-container");

  try {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      const email = form.email.value.trim();
      const password = form.password.value.trim();

      let usersData = await get(url);
      const foundUser = usersData.find(u => u.email === email && u.password === password);

      if (!foundUser) {
        alert("Correo o contraseña incorrectos.");
        return;
      }

      sessionStorage.setItem("loggedUser", JSON.stringify(foundUser));
      alert(`Bienvenido, ${foundUser.name}`);
      navigate("/home");
    });
  } catch (err) {
    console.error("Error:", err);
  }
}

// Muestra el nombre y rol del usuario logueado en la barra lateral
function renderSidebarUser() {
  const user = JSON.parse(sessionStorage.getItem("loggedUser"));

  const nameElement = document.getElementById("sidebar-username");
  const roleElement = document.getElementById("sidebar-role");    

  if (user) {
    nameElement.textContent = user.name;
    roleElement.textContent = user.role;
  } else {
    nameElement.textContent = "Invitado";
    roleElement.textContent = "";
  }
}
