'use strict';


const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');
/// NOTE IN index.html where we included cript.js. No matter how many script we included they all have access to all other scirpt declared bloew them. for ex srcipt 2 in index.html declared can access all variables in script 3 declared after it but cannot acces to script 1 declared before it.
// inputCadence
//   .closest('.form__row')
//   .classList.remove('form__row--hidden'); ///Extra step from my end
class workout {
  date = new Date();
  id = (Date.now() + '').slice(-10);
  // id = ((Math.random *1) + 1000).toString();
  constructor(coords, distance, duration) {
    // this.date = ..
    // this.id =... // we currently have to intialize by this but we have done with miodern es6 mnethod nwhich will soon gonna add
    this.coords = coords;
    this.distance = distance;

    this.duration = duration;
  }
    // prettier-ignore
    
    _setDescription(){
  const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  this.description = `${this.type[0].toUpperCase()+ this.type.slice(1) }on ${months[this.date.getMonth()]}${this.date.getDate()}}`
}
}
class Cycling extends workout {
  type ="cycling";
  constructor(coords, distance, duration, elevationGain) {
    super(coords, distance, duration);
    this.elevationGain = elevationGain;
    this.calcElevation();
    this._setDescription();
  }
  //calculating pace(learn word pace)
  calcElevation() {
    this.speed = this.distance / (this.duration / 60);
    return this.speed; // we can also return pace from here or call constructor directly wtih this function name to get value because constructor gets called everytiome the classes reload
  }

}
class Running extends workout {
  type ="running";
  constructor(coords, distance, duration, cadence) {
    super(coords, distance, duration);
    this.cadence = cadence;
    this.calcPace();
    this._setDescription();
  }
  //calculating pace(learn word pace)
  calcPace() {
    this.pace = this.duration / this.distance;
    return this.pace; // we can also return pace from here or call constructor directly wtih this function name to get value because constructor gets called everytiome the classes reload
  }
}
//tetsing the classess
const r = new Running([45,-4], 56,2,34);
const c = new Cycling([45,-4], 5,2,374);
console.log(r,c);
///////##################### ARCHITECTURE IMPLEMENTATION ####################//////////////////
class APP {
  #map;
  #workouts = [];
  #mapEVent;
  constructor() {
    this._getPosition();
    this._getLocalStorage();
    form.addEventListener('submit', this._newWorkout.bind(this));
    inputType.addEventListener('change', this._toggleElevationField);
    containerWorkouts.addEventListener("click" , this._moveToPopup.bind(this))
  }
  _getPosition() {
    if (navigator.geolocation)
      navigator.geolocation.getCurrentPosition(
        this._loadMap.bind(this),

        function () {
          alert(`Oops !! there is an error reported.`);
        }
      );
  }
  _loadMap(position) {
    const { latitude } = position.coords;
    const { longitude } = position.coords;
    // console.log(`https://www.google.com/maps/@${latitude},${longitude}`);
    // WE have  used Leaflets an prebuild libvrary
    const cc = [latitude, longitude];

    this.#map = L.map('map').setView(cc, 13);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    this.#map.on('click', this._showForm.bind(this));
    this.#workouts.forEach(work => {
      this._renderWorkoutMarker(work);
    });
  }

  _showForm(mm) {
    this.#mapEVent = mm;
    form.classList.remove('hidden');
    inputDistance.focus();
  }
  _hideForm() {
    // Empty inputs
    inputDistance.value = inputDuration.value = inputCadence.value = inputElevation.value =
      '';

    form.style.display = 'none';
    form.classList.add('hidden');
    setTimeout(() => (form.style.display = 'grid'), 1000);
  }
  _toggleElevationField() {
    inputCadence.closest('.form__row').classList.toggle('form__row--hidden');
    inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
  }
  _newWorkout(e) {

    const validInputs = (...inputs) =>
      inputs.every(inp => Number.isFinite(inp));
    const allPositive = (...inputs) => inputs.every(inp => inp > 0);

    e.preventDefault();

    // Get data from form
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const { lat, lng } = this.#mapEVent.latlng;
    let workout;

    // If workout running, create running object
    if (type === 'running') {
      const cadence = +inputCadence.value;

      // Check if data is valid
      if (
        // !Number.isFinite(distance) ||
        // !Number.isFinite(duration) ||
        // !Number.isFinite(cadence)
        !validInputs(distance, duration, cadence) ||
        !allPositive(distance, duration, cadence)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Running([lat, lng], distance, duration, cadence);
    }

    // If workout cycling, create cycling object
    if (type === 'cycling') {
      const elevation = +inputElevation.value;

      if (
        !validInputs(distance, duration, elevation) ||
        !allPositive(distance, duration)
      )
        return alert('Inputs have to be positive numbers!');

      workout = new Cycling([lat, lng], distance, duration, elevation);
    }
    this.#workouts.push(workout);
this._renderWorkoutMarker(workout);
this._setLocalStorage();
this._renderWorkoutList(workout);
this._hideForm();
// this._setLocalStorage();
    e.preventDefault();
    // console.log(mapEVent);
    // const { lat, lng } = this.#mapEVent.latlng;
    inputDuration.value = inputCadence.value =inputDistance.value =inputElevation.value ='';
  }
  _renderWorkoutList(workout){
    let html = `  <li class="workout workout--${workout.type}" data-id="${workout.id}">
    <h2 class="workout__title">${workout.description}</h2>
    <div class="workout__details">
      <span class="workout__icon">${workout.type === 'running' ?'🏃‍♂️' : '🚴‍♀️'}</span>
      <span class="workout__value">${workout.distance}</span>
      <span class="workout__unit">km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⏱</span>
      <span class="workout__value">${workout.duration}</span>
      <span class="workout__unit">min</span>
    </div>`;

    if(workout.type === "running"){
      html +=` <div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.pace.toFixed(1)}</span>
      <span class="workout__unit">min/km</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">🦶🏼</span>
      <span class="workout__value">${workout.cadence}</span>
      <span class="workout__unit">spm</span>
    </div>
  </li>`;
    }
    if(workout.type ==='cycling')
      html +=`<div class="workout__details">
      <span class="workout__icon">⚡️</span>
      <span class="workout__value">${workout.speed}</span>
      <span class="workout__unit">km/h</span>
    </div>
    <div class="workout__details">
      <span class="workout__icon">⛰</span>
      <span class="workout__value">${workout.elevationGain}</span>
      <span class="workout__unit">m</span>
    </div>
  </li> `;

form.insertAdjacentHTML("afterend" , html);

  }
_moveToPopup(e){
  const workOutEl = e.target.closest(".workout");

  if(!workOutEl){return;}
  const matchWorkout = this.#workouts.find(e => e.id===workOutEl.dataset.id);
  console.log(matchWorkout);
  this.#map.setView(matchWorkout.coords, 13, {
    animate: true,
    pan: {
      duration: 1,
    },
  });
}
  _renderWorkoutMarker(workout){ 
      L.marker(workout.coords)
      .addTo(this.#map)
      .bindPopup(
        L.popup({
          maxWidth: 250,
          minWidth: 100,
          autoClose: false,
          closeOnClick: false,
          className: `${workout.type}-popup`,
        })
      )
      .setPopupContent(
        `${workout.type === 'running' ?'🏃‍♂️' : '🚴‍♀️' } ${workout.description}`
      )
      .openPopup();
    }
  
  _setLocalStorage(){
    localStorage.setItem("workouts" , JSON.stringify(this.#workouts));
  }
  _getLocalStorage() {
    const data = JSON.parse(localStorage.getItem('workouts'));

    if (!data) return;

    this.#workouts = data;

    this.#workouts.forEach(work => {
      this._renderWorkoutList(work);
    });
  }
reset(){
  localStorage.removeItem("workouts");
  location.reload();
}}
const app = new APP();
///one we get list or jason object from local storage then these objects lost theier prot property all losst all funciton and properties of thier parents