// Section for global variable(s)
let storedWeatherSearches;

// Request the weather from the OpenWeatherMap API
function getWeather(city, recent) {
    // Request to convert the given city name into lat/long coordinates
    fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${city}&appid=87a7dcebc167b62258903de03de66be6`)
    .then( function(response) {
        return response.json();
    })
    .then( function(data) {
        // Make sure the user requested a valid city
        if (data.length > 0) {
            // If the city is valid, request the weather using the returned lat/long coordinates
            fetch(`https://api.openweathermap.org/data/2.5/onecall?lat=${data[0].lat}&lon=${data[0].lon}&appid=87a7dcebc167b62258903de03de66be6`)
            .then( function(response) {
                return response.json();
            })
            .then( function(data) {
                // Parse and display the current and forecasted weather
                parseWeather(data, city);
                // If the request didn't come from a recent search button, update the recent searches list
                if (!recent) {    
                    setRecentSearches(city);
                    getRecentSearches();
                }
            })
        } 
        
    });
}
// Convert the proved kelvin temperature to fahrenheit
function convertTempToFahrenheit(temp) {
    return(Math.floor((temp - 273.15) * 1.8 + 32));
}
// Parse out and display the weather
function parseWeather(weatherData, city) {
    // Populate the current day's weather elements with the data
    $('#city-date').text(city + ' ' + (new Date(weatherData.current.dt*1000)).toLocaleDateString("en-US"));
    $('#currentDayIcon').attr('src', 'http://openweathermap.org/img/w/' + weatherData.current.weather[0].icon + '.png').removeClass('d-none').addClass('d-inline');
    $('#currentTemp').text('Temp: ' + convertTempToFahrenheit(weatherData.current.temp));
    $('#currentWind').text('Wind: ' + weatherData.current.wind_speed);
    $('#currentHumidity').text('Humidity: ' + weatherData.current.humidity);
    $('#currentUVI').text('UV Index: ').append('<span class="uvSpan">' + weatherData.current.uvi + '</span>');
    // LOop through the 5 day future forecast and populate the weather cards
    for (let i = 1; i <= 5; i++) {
        $('#' + i + 'DayDate').text(new Date(weatherData.daily[i].dt*1000).toLocaleDateString("en-US"));
        $('#' + i + 'DayIcon').attr('src', 'http://openweathermap.org/img/w/' + weatherData.daily[i].weather[0].icon + '.png').removeClass('d-none').addClass('d-block');
        $('#' + i + 'DayTemp').text('Temp: ' + convertTempToFahrenheit(weatherData.daily[i].temp.day) + String.fromCharCode(176) + 'F');
        $('#' + i + 'DayWind').text('Wind: ' + weatherData.daily[i].wind_speed + ' MPH');
        $('#' + i + 'DayHumidity').text('Humidity: ' + weatherData.daily[i].humidity + '%');
    }
}
// Pull the recent searches from local storage
function getRecentSearches() {
    storedWeatherSearches = localStorage.getItem('recentWeatherSearches');
    // Check if there's actually anything in local storage
    if (storedWeatherSearches != null) {
        // If there is, parse out the stored city list
        storedWeatherSearches = JSON.parse(storedWeatherSearches);
        // remove any existing recent search buttons
        $('#recentSearches').children().replaceWith();
        // loop through the list and add a button for each one
        for (let i = 0; i < storedWeatherSearches.length; i++) {
            let recentSearchButton = $("<button></button>").addClass('w-100 m-1 btn btn-secondary recentSearch').val(storedWeatherSearches[i]).text(storedWeatherSearches[i]);
            $('#recentSearches').append(recentSearchButton);
        }
    }

}
function setRecentSearches(city) {
    // If the localStorage city list is empty, create a new array
    if (storedWeatherSearches == null) {
        storedWeatherSearches = [];
    }
    // Check if the city already exists in recent searches. If it does, remove it.
    const index = storedWeatherSearches.indexOf(city);
    if (index > -1) {
        storedWeatherSearches.splice(index, 1);
    }
    // Add the most recently searched city to the array
    storedWeatherSearches.unshift(city);
    // If there's more than 8 cities in the array, remove the last one
    if (storedWeatherSearches.length > 8) {
        storedWeatherSearches.pop();
    }
    // save the array in local storage
    localStorage.setItem('recentWeatherSearches', JSON.stringify(storedWeatherSearches));
}

// Get the stored searches on page load
getRecentSearches();

// Add an event listener for searching a new city
$('#search').on('click', function(e) {
    // prevent page reload
    e.preventDefault();
    // get the weather
    getWeather($('#cityInput').val(), false);
})

// Add an event listener for searching with a recent search button
$('.recentSearch').on('click', function(e) {
    // prevent page reload
    e.preventDefault();
    // get the weather
    getWeather(e.target.value, true);
})


    