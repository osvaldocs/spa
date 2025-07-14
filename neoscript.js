import { get, post, update, deletes } from './services.js';

// Variables globales
let currentUser = JSON.parse(sessionStorage.getItem("loggedUser")); // Recupero al usuario logueado si existe en sessionStorage
const usersURL = "users";
const coursesURL = "courses";
const enrollmentsURL = "enrollments";

// ======================== LOGIN ========================
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("login-form");
  if (loginForm) {
    // Si estamos en la página de login, escuchamos el submit
    loginForm.addEventListener("submit", handleLogin);
  }
});

// Esta función maneja el login: busca el user en la "base" y si matchea lo guarda en sesión
async function handleLogin(e) {
  e.preventDefault();
  const email = e.target.email.value.trim(); // saco espacios por si el user escribe con barra
  const password = e.target.password.value.trim();
  const users = await get(usersURL); // traigo todos los usuarios del json-server

  const found = users.find(user => user.email === email && user.password === password); // chequeo credenciales
  if (!found) return alert("Credenciales incorrectas"); // si no está, chau

  sessionStorage.setItem("loggedUser", JSON.stringify(found)); // si está bien, lo guardo
  window.location.href = found.role === "admin" ? "./dashboard.html" : "./public.html"; // según el rol, lo mando a una vista u otra
}

// ======================== RENDER USUARIOS ========================
// Renderiza tabla con todos los usuarios (solo admin debe ver esto)
export async function renderUsers() {
  const userList = document.getElementById("user-table-body");
  const users = await get(usersURL);
  userList.innerHTML = ""; // limpio la tabla por si ya hay algo

  users.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.role}</td>
      <td>
        <button onclick="editUser(${user.id})">Editar</button>
        <button onclick="deleteUser(${user.id})">Eliminar</button>
      </td>
    `;
    userList.appendChild(row); // agrego cada fila a la tabla
  });
}

// ======================== RENDER CURSOS ========================
// Renderiza la tabla de cursos (visibles para todos)
export async function renderCourses() {
  const courseList = document.getElementById("course-table-body");
  const courses = await get(coursesURL);
  courseList.innerHTML = "";

  courses.forEach(course => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${course.title}</td>
      <td>${course.description}</td>
      <td>${course.startDate}</td>
      <td>${course.duration}</td>
      <td>
        <button onclick="editCourse(${course.id})">Editar</button>
        <button onclick="deleteCourse(${course.id})">Eliminar</button>
      </td>
    `;
    courseList.appendChild(row);
  });
}

// ======================== DELETE FUNCTIONS ========================
// Borra un usuario (solo admin debería tener acceso a esto)
export async function deleteUser(id) {
  const confirmDelete = confirm("¿Seguro que querés eliminar este usuario?");
  if (!confirmDelete) return;
  await deletes(usersURL, id);
  renderUsers(); // actualizo la tabla
}

// Borra un curso (también solo admin)
export async function deleteCourse(id) {
  const confirmDelete = confirm("¿Seguro que querés eliminar este curso?");
  if (!confirmDelete) return;
  await deletes(coursesURL, id);
  renderCourses(); // refresco la vista
}

// ======================== LOGOUT ========================
// Escucha clicks en cualquier lado del doc, si es sobre el logout, borra al user y redirige al login
document.addEventListener("click", (e) => {
  if (e.target.id === "logout") {
    sessionStorage.removeItem("loggedUser");
    window.location.href = "./login.html";
  }
});

/*



2. Está separado de los fetch para no mezclar responsabilidades (SRP).
3. Si te hace falta registrar usuarios o cursos, hacelo en forms separados y usá `post()`.
4. En el login solo los admin van a dashboard y los demás a public.
5. Te conviene tener IDs fijos en los HTML como "user-table-body", "course-table-body", etc.
6. Las funciones editUser y editCourse todavía no están pero las podés clonar fácil desde update.
7. Siempre validá el role en cada vista por seguridad.
8. Podés proteger vistas desde el HTML también: si no hay currentUser, redirigí.
9. Si un visitante no debería ver botones, escondelos con JS (`style.display = "none"`).
10. Y si todo se rompe, revisá el orden de carga de los scripts y el id de los elementos.


*/
