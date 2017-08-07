function initMap() {
				var map = new google.maps.Map(document.getElementById('map'), {
					mapTypeControl: false,
					center: {lat: 48.466512, lng: 35.047020},
					zoom: 8
				});

				new AutocompleteDirectionsHandler(map);
			}

			 // @constructor
			function AutocompleteDirectionsHandler(map) {
				this.map = map;
				this.originPlaceId = null;
				this.destinationPlaceId = null;
				this.waypointPlaceId = null;
				this.travelMode = 'DRIVING';
				var originInput = document.getElementById('origin-input');
				var destinationInput = document.getElementById('destination-input');
				var waypointInput = document.getElementById('waypoint-input');
				this.directionsService = new google.maps.DirectionsService;
				this.directionsDisplay = new google.maps.DirectionsRenderer;
				this.directionsDisplay.setMap(map);

				var originAutocomplete = new google.maps.places.Autocomplete(
						originInput, {placeIdOnly: true});
				var destinationAutocomplete = new google.maps.places.Autocomplete(
						destinationInput, {placeIdOnly: true});
				var waypointAutocomplete = new google.maps.places.Autocomplete(
						waypointInput, {placeIdOnly: true});

				this.setupPlaceChangedListener(originAutocomplete, 'ORIG');
				this.setupPlaceChangedListener(destinationAutocomplete, 'DEST');
				this.setupPlaceChangedListener(waypointAutocomplete, 'WAYP');
			}

			AutocompleteDirectionsHandler.prototype.setupPlaceChangedListener = function(autocomplete, mode) {
				var me = this;
				autocomplete.bindTo('bounds', this.map);
				autocomplete.addListener('place_changed', function() {
					var place = autocomplete.getPlace();
					if (!place.place_id) {
						window.alert("Please select an option from the dropdown list.");
						return;
					}
					if (mode === 'ORIG') {
						me.originPlaceId = place.place_id;
					} else if (mode === 'DEST') {
						me.destinationPlaceId = place.place_id;
					} else if (mode === 'WAYP') {
						me.waypointPlaceId = place.place_id;
						document.getElementById('waypoint-input').value = "";
					}
					me.route();
				});
			};

			var waypoint = [];

			function saveToLS() {
				if(!window.storage) {
					return;
				} else localStorage.setItem(Date.now(), JSON.stringify(window.storage));
			}

			window.onload = function () {
				window.archive = [];
						keys = Object.keys(localStorage),
						i = keys.length;
				while (i--) {
					window.archive.push(JSON.parse(localStorage.getItem(keys[i])));
				}
				console.log(waypoint);
				console.log(window.archive);
				let selectDirection = document.getElementById('select-direction');
					for(var i = 0; i < window.archive.length; i++) {
						var opt = window.archive[i];
						var el = document.createElement('option');
						el.textContent = Object.values(opt);
						el.value = opt;
						selectDirection.appendChild(el);
					}
			}

			function clearLS() {
				var clear = confirm("Действительно очистить?")
				if(!!clear) {
					localStorage.clear();
				} else return;
			}

			AutocompleteDirectionsHandler.prototype.route = function() {
				if (!this.originPlaceId || !this.destinationPlaceId) {
					return;
				} else if (this.waypointPlaceId !== null) {
					console.log(waypoint.length)
						if(waypoint.length > 2) {
							window.alert("Допустимо не больше 5 точек на маршруте")
							return;
						} else waypoint.push({
							location: {placeId: this.waypointPlaceId},
							stopover: true
						})
					}
				var me = this;

				// var request;
				// request = window.storage;

				window.storage = {
					origin: {placeId: this.originPlaceId},
					destination: {placeId: this.destinationPlaceId},
					waypoints: waypoint,
					travelMode: this.travelMode
				};
				this.directionsService.route(window.archive[0], function(response, status) {
					if (status === 'OK') {
						me.directionsDisplay.setDirections(response);
					} else {
						window.alert('Directions request failed due to ' + status);
					}
				});
			};

