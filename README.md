# City Mouse Chase

---

## À propos du jeu

City Mouse Chase est un jeu 3D interactif développé avec [Three.js](https://threejs.org/).  
Le joueur se déplace dans une ville 3D générée procéduralement et doit attraper des créatures (crabes, abeilles, ennemis, crânes…) qui fuient activement à travers les rues.

Fonctionnalités principales :
- Ville générée dynamiquement avec bâtiments 3D (GLB) et routes.
- Caméra FPS contrôlée à la souris via `PointerLockControls`.
- IA de fuite : les créatures détectent le joueur et s'échappent activement, avec zigzag panique au corps à corps.
- Difficulté progressive : la vitesse de la créature augmente avec le temps (Facile, Moyen, Difficile, EXTRÊME).
- Collisions joueur : le joueur ne peut pas traverser les bâtiments (glissement le long des murs).
- HUD complet : timer, score, indicateur de difficulté, crosshair et prompt contextuel.
- Effets sonores : capture, musique de fond et écran de fin.

---

## Contrôles

| Touche                             | Action                                                    |
| ---------------------------------- | --------------------------------------------------------- |
| `Z` / `Q` / `S` / `D` ou `↑ ↓ ← →` | Se déplacer                                               |
| Souris                             | Regarder autour                                           |
| `E`                                | Attraper la créature (quand elle est en face et à portée) |
| Clic gauche                        | Verrouiller la souris et démarrer la musique              |

---

## Inspirations et ressources

### Three.js
Le jeu s'appuie sur les exemples FPS officiels de Three.js :  
- [Exemple FPS Three.js](https://threejs.org/examples/?q=fps#games_fps)

Ces exemples ont servi de base pour :
- Le mouvement FPS avec `PointerLockControls`.
- La gestion de la caméra et la boucle de rendu.

### Raycaster
Le `Raycaster` de Three.js est utilisé à deux endroits :
1. **Interaction joueur** — détecter si la créature est face au joueur et à portée pour la touche `E` ([doc Raycaster](https://threejs.org/docs/#api/en/core/Raycaster)).
2. **IA de la créature** — 5 "moustaches" de raycasts balayent les angles autour de la créature pour détecter les obstacles (bâtiments) et choisir une direction libre avant de se déplacer.

### Détection de collisions joueur (AABB)
Les collisions joueur-bâtiments sont gérées par des **Axis-Aligned Bounding Boxes** (`THREE.Box3`) :  
- Les AABB de tous les meshes de bâtiments sont pré-calculées au chargement.
- Le déplacement est séparé sur les axes X et Z pour permettre le glissement le long des murs.
- Référence : [THREE.Box3 — Three.js docs](https://threejs.org/docs/#api/en/math/Box3)

### Audio & autoplay
La musique utilise l'[Audio Listener Three.js](https://threejs.org/docs/#api/en/audio/AudioListener) attaché à la caméra. La politique autoplay des navigateurs peut bloquer les sons non déclenchés par une interaction utilisateur : le code gère une **race condition** entre le clic utilisateur et le chargement du buffer audio en mémorisant l'intention de lecture (`wantsMusic`).

### Modèles 3D (Bâtiments)
Les bâtiments proviennent de [Poly Pizza](https://poly.pizza/search/buildings) :
- Plusieurs modèles `.glb` différents sont chargés en parallèle via `Promise.all`.
- Chaque modèle est redimensionné et repositionné verticalement selon son index.

### Modèles 3D (Créatures)
Les créatures animées (`.gltf`) sont tirées aléatoirement parmi :
- `Crab.gltf`, `Bee.gltf`, `Enemy.gltf`, `Skull.gltf`

Chaque modèle intègre des animations jouées via `THREE.AnimationMixer`.

### Sons
Les sons proviennent de [Pixabay Sound Effects](https://pixabay.com/sound-effects/) :
- `catch.mp3` — son de capture
- `bg-sound.mp3` — musique de fond (en boucle)
- `gameover.mp3` — son de fin de jeu

---

## Fonctionnalités techniques

**Ville générée procéduralement**
- Bâtiments GLB chargés en parallèle (`Promise.all`), ajustés verticalement selon leur bounding box.
- Routes créées en grille sur les deux axes.

**IA de la créature**
- Détecte le joueur dans un rayon de 12 unités et fuit activement.
- Zigzag panique à moins de 5 unités (sinus de haute fréquence).
- Évitement d'obstacles via 5 raycasts angulaires (−60° → +60°).
- Rotation interpolée dans le sens du déplacement.
- Vitesse croissante sur 2 minutes : ease-in quadratique de 2.2 à 7.5 u/s.

**Collisions joueur**
- AABB de tous les meshes de bâtiments précalculées 2s après le lancement.
- Séparation des axes X et Z pour permettre le glissement le long des murs.
- Hauteur de caméra maintenue constante à `y = 0.5`.

**HUD**
- Timer au format `MM:SS`.
- Score avec animation pop.
- Indicateur de difficulté : Facile (vert) → Moyen (jaune) → Difficile (orange) → EXTRÊME (rouge), avec flash visuel à chaque changement.
- Prompt `E — Attraper` affiché uniquement quand la créature est en face et à portée.
- Crosshair SVG centré.

**Écran de fin**
- Overlay victoire (vert) ou défaite (rouge) avec le temps final et un bouton Rejouer.

---

## Structure du projet

```
src/
├── scene.ts              # Scène principale, boucle de rendu, collisions joueur
├── hud.ts                # Overlay HUD (timer, score, difficulté, prompt)
└── entities/
    ├── mouse.ts          # IA de la créature (fuite, évitement, difficulté)
    ├── building.ts       # Chargement et positionnement des bâtiments GLB
    ├── city.ts           # Génération de la ville (bâtiments + routes)
    ├── ground.ts         # Sol
    └── roads.ts          # Création des routes
public/
├── models/               # Fichiers .gltf / .glb (créatures et bâtiments)
└── sounds/               # Fichiers audio (catch, bg-sound, gameover)
```