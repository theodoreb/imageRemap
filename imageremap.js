/**
 * 2010-08-03
 * Théodore Biadala
 *
 * http://theodoreb.net/blog/redimensionner-une-imagemap-avec-javascript
 * http://theodoreb.net/blog/finitions-pour-les-imagemap-et-javascript
 *
 * À utiliser comme bon vous semble, prévenez moi, c'est toujours sympa :)
 */
var imageRemap;

(function () {

  var cache = null;

  /**
   * Fix IE, rajoute les naturalWidth et naturalHeight de l'image.
   *
   * @param {HTMLImageElement} img
   * @return {HTMLImageElement}
   */
  function naturalDimensions (img) {
    // si l'un existe, l'autre aussi. On a affaire à un bon navigateur, on s'arrête.
    if ('naturalWidth' in img) { return img; }

    // on commence les tours de passe-passe
    var
      // ceci est la copie sur laquelle on va travailler
      copie = img.cloneNode(false),

      // un petit raccourci
      s = copie.style;

    // remet tous les styles par défaut
    s.width = 'auto';
    s.height = 'auto';
    // pour que les tailles soient disponible il faut ajouter la copie au DOM
    // donc on cache l'image pour pas avoir de surprises
    // on utilise visibility au lieu de display car même si l'élément ne
    // s'affiche pas il réserve sa place lors du rendu, les dimensions sont calculées.
    s.visibility = 'hidden';
    // et on la positionne hors de l'écran pour être bien sûr
    s.position = 'absolute';
    s.top = '100%';
    // on l'ajoute au DOM pour que les tailles soient calculés
    document.body.appendChild(copie);

    // on ajoute les dimensions originales à notre image redimensionnée
    img.naturalWidth = copie.clientWidth;
    img.naturalHeight = copie.clientHeight;

    // on supprime la copie
    document.body.removeChild(copie);

    // et l'on renvoie l'objet modifié
    return img;
  }

  /**
   * Modifie les coordonnées des points contenus dans coords selon un ratio arbitraire
   *
   * @param {HTMLAreaElement} area
   */
  function resize (area) {
    var
      // on transforme un chaine "10,20,30" en tableau de chaines ["10", "20", "30"]
      coords = area.coords.split(','),

      // pour que l'on fasse référence à la bonne valeur dans map()
      ratio = this;

    // on crée un nouveau tableau contenant les bonnes coordonnées avec map()
    // ici on prend en compte un changement de ratio x/y
    for (var i = 0, n = coords.length; i < n; i += 2) {
      coords[i] = Math.round(parseInt(coords[i], 10) * ratio.x);
      coords[i + 1] = Math.round(parseInt(coords[i + 1], 10) * ratio.y);
    }

    // on met toutes les coordonnées à jour d'un coup
    // ce n'est pas obligatoire mais ça limite le risque de problème
    area.coords = coords.join(',');
  }

  /**
   * Cette fonction se charge de redéfinir les <area> pour une image redimensionnée
   *
   * @param {HTMLImageElement} img
   */
  function remap (img) {
    var
      // le ratio de redimensionnement
      // on est sûr que naturalWidth existe pour tout le monde
      // on calcule séparément ratio hauteur et ratio largeur, des fois qu'on
      // redimensionne l'image à la Rache™.
      ratio = {
        x: img.clientWidth / img.naturalWidth,
        y: img.clientHeight / img.naturalHeight
      };

      // on récupère notre imagemap en utilisant son id
      imagemap = document.getElementById(img.getAttribute("usemap").replace('#', ''));

    // petite vérification, si on a pas d'imagemap il n'y a rien à traiter
    if (!imagemap) { return false; }

    // on utilise la méthode forEach pour parcourir la liste d'éléments
    Array.prototype.forEach.call(imagemap.getElementsByTagName("area"), resize, ratio);
  }

  /**
   * Récupère toutes les images chargés de la page ayant un attribut usemap non vide
   *
   * @return {Array}
   */
  function getAllImages() {
    var
      // on récupère toutes les images de la page
      images = document.getElementsByTagName("img");

    // on ne garde que celles qui on un attribut "usemap" non vide
    // et qui ont fini de charger, pour pouvoir récupérer la taille
    images = Array.prototype.filter.call(images, function (img) {
      return !!img.getAttribute('usemap') && img.complete;
    });

    // on applique naturalDimensions aux éléments
    return images.map(naturalDimensions);
  }

  imageRemap = function (selecteur, viderCache) {
    // on ne donne pas d'arguments à la fonction, par défaut on récupère tout
    if (!cache && !selecteur) {
      cache = getAllImages();
    }
    // on remplit le cache pour faciliter l'appel au script par la suite
    if ((!cache && selecteur) || viderCache) {
      cache = selecteur;
    }
    // on a affaire à un élement unique
    if (cache.tagName) {
      remap(cache);
    }
    // c'est une liste du genre de document.getElementsByTagName()
    else {
      Array.prototype.forEach.call(cache, remap);
    }
  };

})();

// on rajoute les méthodes pour IE et Opera.
if (!Array.prototype.filter) {
  Array.prototype.filter = function(fun /*, thisp*/) {
    var len = this.length >>> 0;
    if (typeof fun != "function") { throw new TypeError(); }
    var res = [];
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this) {
        var val = this[i]; // in case fun mutates this
        if (fun.call(thisp, val, i, this)) { res.push(val); }
      }
    }
    return res;
  };
}

if (!Array.prototype.forEach) {
  Array.prototype.forEach = function(fun /*, thisp*/) {
    var len = this.length;
    if (typeof fun != "function") { throw new TypeError(); }
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this) {
        fun.call(thisp, this[i], i, this);
      }
    }
  };
}

if (!Array.prototype.map) {
  Array.prototype.map = function(fun /*, thisp*/) {
    var len = this.length;
    if (typeof fun != "function") { throw new TypeError(); }
    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++) {
      if (i in this) {
        res[i] = fun.call(thisp, this[i], i, this);
      }
    }
    return res;
  };
}
