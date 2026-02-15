(function () {
  var cubes = [];
  var META_KEYS = ["Nom", "Element", "Rang", "Numero"];

  function normalizeKey(value) {
    if (!value) return "";
    var str = ("" + value).toLowerCase();
    if (typeof str.normalize === "function") {
      str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    return str;
  }

  function getRarityClass(rang) {
    var r = normalizeKey(rang);
    if (r === "commun") return "rarity-commun";
    if (r === "rare") return "rarity-rare";
    if (r === "epique") return "rarity-epique";
    if (r === "mythique") return "rarity-mythique";
    if (r === "exalte") return "rarity-exalte";
    return "";
  }

  function sortCubes() {
    var ordreRang = ["Commun", "Rare", "Epique", "Épique", "Mythique", "Exalte", "Éxalté"];
    cubes.sort(function (a, b) {
      var cmpEl = (a.Element || "").localeCompare(b.Element || "");
      if (cmpEl !== 0) return cmpEl;

      var iA = ordreRang.indexOf(a.Rang || "");
      var iB = ordreRang.indexOf(b.Rang || "");
      if (iA === -1 && iB === -1) {
        var cmpR = (a.Rang || "").localeCompare(b.Rang || "");
        if (cmpR !== 0) return cmpR;
      } else if (iA === -1) {
        return 1;
      } else if (iB === -1) {
        return -1;
      } else if (iA !== iB) {
        return iA - iB;
      }

      var numA = parseInt(a.Numero, 10);
      var numB = parseInt(b.Numero, 10);
      if (!isNaN(numA) && !isNaN(numB) && numA !== numB) return numA - numB;
      return (a.Numero || "").localeCompare(b.Numero || "");
    });
  }

  function populateElementFilter() {
    var select = document.getElementById("elementFilter");
    var values = {};
    for (var i = 0; i < cubes.length; i++) {
      var val = cubes[i].Element || "";
      if (val) values[val] = true;
    }
    var keys = Object.keys(values).sort();
    select.innerHTML = "";
    var opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Tous les elements";
    select.appendChild(opt);
    for (var k = 0; k < keys.length; k++) {
      var o = document.createElement("option");
      o.value = keys[k];
      o.textContent = keys[k];
      select.appendChild(o);
    }
  }

  function getElementBadgeClass(element) {
    var el = (element || "").toLowerCase();
    if (el.indexOf("air") !== -1) return "badge badge-air";
    if (el.indexOf("feu") !== -1) return "badge badge-feu";
    if (el.indexOf("terre") !== -1) return "badge badge-terre";
    if (el.indexOf("eau") !== -1) return "badge badge-eau";
    if (el.indexOf("chaos") !== -1) return "badge badge-chaos";
    if (el.indexOf("lumi") !== -1) return "badge badge-lumiere";
    return "badge";
  }

  function renderCubes() {
    var container = document.getElementById("cards");
    var info = document.getElementById("statsInfo");
    container.innerHTML = "";

    if (!cubes.length) {
      info.textContent = "Aucun cube charge. Verifie que cubes.json est accessible.";
      return;
    }

    var search = document.getElementById("searchInput").value.toLowerCase().trim();
    var elementFilter = document.getElementById("elementFilter").value;
    var total = 0;

    for (var i = 0; i < cubes.length; i++) {
      var cube = cubes[i];

      if (elementFilter && cube.Element !== elementFilter) continue;

      var textForSearch = Object.values(cube).join(" ").toLowerCase();
      if (search && textForSearch.indexOf(search) === -1) continue;

      total++;

      var rangVal = cube.Rang || "";
      var rarityClass = getRarityClass(rangVal);
      var card = document.createElement("article");
      card.className = "cube-card" + (rarityClass ? " " + rarityClass : "");

      var headerDiv = document.createElement("div");
      headerDiv.className = "cube-header";

      var title = document.createElement("div");
      title.className = "cube-title";
      var titleParts = [];
      if (cube.Nom) titleParts.push(cube.Nom);
      if (cube.Element) titleParts.push(cube.Element);
      if (cube.Numero) titleParts.push("N° " + cube.Numero);
      title.textContent = titleParts.join(" ");

      headerDiv.appendChild(title);

      var badges = document.createElement("div");
      badges.className = "cube-badges";

      if (cube.Element) {
        var b = document.createElement("span");
        b.className = getElementBadgeClass(cube.Element);
        b.textContent = cube.Element;
        badges.appendChild(b);
      }
      if (rangVal) {
        var b2 = document.createElement("span");
        b2.className = "badge";
        b2.textContent = rangVal;
        badges.appendChild(b2);
      }

      var statsList = document.createElement("div");
      statsList.className = "cube-stats";

      var cubeKeys = Object.keys(cube);
      for (var j = 0; j < cubeKeys.length; j++) {
        var key = cubeKeys[j];
        if (META_KEYS.indexOf(key) !== -1) continue;
        var value = cube[key];
        if (!value || value === "0") continue;

        var statLine = document.createElement("div");
        statLine.className = "cube-stat-value";
        statLine.textContent = value;
        statsList.appendChild(statLine);
      }

      card.appendChild(headerDiv);
      if (badges.children.length) card.appendChild(badges);
      card.appendChild(statsList);

      container.appendChild(card);
    }

    if (total === 0) {
      info.textContent = "Aucun cube ne correspond aux filtres actuels.";
    } else {
      info.textContent = total + " cube(s) affiches sur " + cubes.length + ".";
    }
  }

  function loadCubes() {
    fetch("cubes.json")
      .then(function (res) { return res.json(); })
      .then(function (data) {
        cubes = data;
        sortCubes();
        populateElementFilter();
        renderCubes();
      })
      .catch(function (err) {
        console.error("Erreur chargement cubes.json:", err);
        document.getElementById("statsInfo").textContent =
          "Erreur: impossible de charger cubes.json. Utilise un serveur local.";
      });
  }

  document.getElementById("searchInput").addEventListener("input", function () {
    renderCubes();
  });
  document.getElementById("elementFilter").addEventListener("change", function () {
    renderCubes();
  });

  // Chargement des cubes depuis le fichier JSON
  loadCubes();
})();
