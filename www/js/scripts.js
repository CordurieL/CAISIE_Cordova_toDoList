// Script de gestion d'une liste de tâches
// @author: Lucas Cordurié

import { Todo } from "./models/todo.js";

/**
 * Fonction qui donne un id de Todo
 * @returns {number}
 */
function getId() {
  let maxId = 0;
  let lis = document.getElementsByTagName("li");
  let kkl = [].slice.call(lis);
  kkl.forEach((li) => {
    if (li.dataset.id > maxId) {
      maxId = parseInt(li.dataset.id);
    }
  });
  return (maxId += 1);
}

/**
 * Fonction qui initialise le button de suppression d'un liste item
 * @param {Array} todos Liste de tâches
 * @param {HTMLElement} liElement
 * @returns {void}
 */
function deleteTaskButtonInit(todos, liElement) {
  let deleteButton = liElement.querySelector(".deleteButton");
  deleteButton.addEventListener("click", (event) => {
    let id = liElement.dataset.id;
    liElement.remove();
    // On supprime le Todo du localStorage
    todos = todos.filter((todo) => todo.id != id);
    saveTodos(todos);
  });
}

/**
 * Fonction qui initialise la checkbox d'un liste item
 * @param {Array} todos Liste de tâches
 * @param {HTMLElement} liElement
 * @returns {void}
 */
function toggleTaskInit(todos, liElement) {
  let checkbox = liElement.querySelector("input[type='checkbox']");
  let title = liElement.getElementsByTagName("h5")[0];
  if (checkbox.checked) {
    title.style.textDecoration = "line-through";
    title.style.color = "grey";
  }
  checkbox.addEventListener("change", (event) => {
    if (checkbox.checked) {
      title.style.textDecoration = "line-through";
      title.style.color = "grey";
      // On met à jour le Todo dans le localStorage
      todos.forEach((todo) => {
        if (todo.id == liElement.dataset.id) {
          todo.done = true;
        }
      });
      saveTodos(todos);
    } else {
      title.style.textDecoration = "none";
      title.style.color = "black";
      // On met à jour le Todo dans le localStorage
      todos.forEach((todo) => {
        if (todo.id == liElement.dataset.id) {
          todo.done = false;
        }
      });
      saveTodos(todos);
    }
  });
}

/**
 * Fonction qui donne le code html correspondant à un Todo
 * @returns {string} html
 */
function getTodoHtml(todo) {
  if (todo instanceof Todo) {
    let li = "<li data-id='" + todo.id + "' class='list-group-item'>";
    li += "<div class='row'>";
    li += "<div class='my-auto col-1'>";
    li +=
      "<input data-id='" +
      todo.id +
      "' type='checkbox' class='form-check-input fs-3 m-auto' " +
      (todo.done ? "checked" : "") +
      ">";
    li += "</div>";
    li += "<div class='my-auto col-9'>";
    li += "<h5 class='my-auto text-break'>" + todo.title + "</h5>";
    li +=
      "<p class='my-auto small text-muted'>Date limite : " +
      new Date(todo.date).toLocaleDateString("fr-Fr") +
      "</p>";
    li += "</div>";
    li += "<div class='my-auto ml-auto col-2'>";
    li +=
      "<button type='button' class='deleteButton btn btn-outline-danger ml-auto'>";
    li += "<i class='fas fa-trash'></i>";
    li += "</button>";
    li += "</div>";
    li += "</div>";
    li += "</li>";
    return li;
  } else {
    return null;
  }
}

/**
 * Fonction qui sauvegarde la liste de tâches dans le localStorage
 * @param {Array} todos Liste de tâches
 * @returns {void}
 */
function saveTodos(todos) {
  localStorage.setItem("todos", JSON.stringify(todos));
}

/**
 * Fonction qui ajoute un Todo au Dom et lui donne ses eventListeners
 * @param {Array} todos Liste de tâches
 * @param {object} todo Objet todo a inserer
 * @return {boolean} vrai si ajouté, sinon faux
 */
function addTodo(todos, todo) {
  // Récupère l'html correspondant au Todo
  let liHtml = getTodoHtml(todo);
  if (liHtml != null) {
    // Ajoute le liste item à la liste
    let promise = new Promise((resolve, reject) => {
      let ul = document.getElementById("list");
      ul.insertAdjacentHTML("beforeend", liHtml);
      resolve();
    });
    promise.then(() => {
      // Récupère le liste item inséré
      let liElement = document.querySelector("li[data-id='" + todo.id + "']");
      // Applique les listeners du nouvel liste item
      deleteTaskButtonInit(todos, liElement);
      toggleTaskInit(todos, liElement);
    });
    return true;
  } else {
    console.error("L'ajout n'a pas pu aboutir");
    return false;
  }
}

/**
 * Fonction ajoutant une tâche à la liste à l'envoi du formulaire
 * @param {Array} todos Liste de tâches
 * @returns {void}
 */
function submitTask(todos) {
  // Récupération des données du formulaire
  let title = document.getElementById("todo-title-input").value;
  let date = document.getElementById("todo-date-input").value;
  if (title != null && title.trim() != "" && date != null && date != "") {
    // Si les champs sont remplis on crée une nouveau Todo
    let todo = new Todo(getId(), title, date);
    if (addTodo(todos, todo)) {
      // Vide les champs
      document.getElementById("todo-title-input").value = "";
      document.getElementById("todo-date-input").value = "";
      // Cacher la modale
      let modal = document.getElementById("addModal");
      let modalInstance = bootstrap.Modal.getInstance(modal);
      modalInstance.hide();
      // On ajoute le Todo au localStorage
      todos.push(todo);
      saveTodos(todos);
    }
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // Lorsque le DOM est chargé
  // On recupère les todos du localStorage
  let todos = [];
  if (localStorage.getItem("todos") != null) {
    todos = JSON.parse(localStorage.getItem("todos"));
    todos.forEach((todo) => {
      addTodo(todos, new Todo(todo.id, todo.title, todo.date, todo.done));
    });
  }

  // On change le comportement du formulaire
  let form = document.getElementById("todo-form");
  function handleForm(event) {
    event.preventDefault();
    submitTask(todos);
  }
  form.addEventListener("submit", handleForm);
});
