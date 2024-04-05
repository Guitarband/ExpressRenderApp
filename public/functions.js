document.getElementById("summonerForm").addEventListener("submit", function(event) {
    event.preventDefault(); // Prevent form submission
    
    // Get the summoner name from the input field
    const summonerName = document.getElementById("summonerSearch").value;
    
    // Redirect to the /summoner/:summonerName route
    window.location.href = window.location.href = '/summoner/' + summonerName;
});
