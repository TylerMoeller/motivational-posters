$(document).ready(function () {
  getPoster();
  $('#reload').click(getPoster);
});

// The 'done' class is added to .imagebox and .quote-text at the end of each API call
// Ensure both API calls are complete, stop the spinner, and present the final poster
function displayPoster() {
  if ($('.imagebox').hasClass('done') && $('.quote-text').hasClass('done')) {
    $('.imagebox, .quote-text').removeClass('done');
    $('#spinner').addClass('hide');
    $('.poster').fadeIn(1500).removeClass('hide');
  }
}

function getPhoto() {
  var img = new Image();
  img.crossOrigin = 'anonymous';
  img.src = 'https://source.unsplash.com/category/nature/1280x800?sig=' +
  (Math.random() * 10000).toFixed(0); // random number at end prevents caching

  // Mobile browsers hit CORS issues with this code. Use a proxy as a temp workaround
  if (typeof window.orientation !== 'undefined') img.src = 'https://crossorigin.me/' + img.src;

  // ColorThief library uses <canvas> to get the primary color of the image
  // brightness formula determines if text will be bright enough on the black background
  $(img).load(function () {
    var rgb = new ColorThief().getColor(img),
      brightness = Math.sqrt((0.299 * Math.pow(rgb[0], 2)) +
                             (0.587 * Math.pow(rgb[1], 2)) +
                             (0.114 * Math.pow(rgb[2], 2)));
    var borderColor = 'rgb(' + rgb + ')',
      textColor = borderColor;
    if (brightness < 60) textColor = '#bdbdbd';

    $('.imagebox, .underline').css('border-color', borderColor);
    $('#quote-title').css('color', textColor);
    $('.imagebox').css('background-image', 'url(' + img.src + ')').addClass('done');
    displayPoster();
  });
}

// Get a quote from the Forismatic API
function getQuote() {
  var url = 'http://api.forismatic.com/api/1.0/?method=getQuote&format=jsonp&lang=en&jsonp=?',
  titles = [
    'INTEGRITY',  // Random (cheesy) categories for the "motivational" quotes
    'MOTIVATION',
    'POTENTIAL',
    'TRADITION',
    'ATTITUDE',
    'AMBITION',
    'COMPASSION',
    'INNOVATION',
    'ASPIRATION',
    'VISION'
  ];

  // HTTPS hack...Forismatic doesn't support HTTPS, use a proxy when needed.
  if (window.location.protocol !== 'http:') url = 'https://crossorigin.me/' + url;

  // Call the Forismatic API to get a random quote
  $.getJSON(url).done(function (data) {
    var quoteText = data.quoteText.trim(),
      quoteAuthor = data.quoteAuthor.trim() || 'Anonymous';

    $('#quote-title').html(titles[Math.floor(Math.random() * titles.length)]);
    $('.quote-text').html('"' + quoteText + '"<br>~ ' + quoteAuthor).addClass('done');
  }).fail(function (err) {
    alert('Error, please try again. Error Message: ', err);
  }).complete(function () {
    displayPoster();
  });
}

// Add a spinner, fade out the poster, and get a new photo + quote
function getPoster() {
  $('.poster').fadeOut(1000).promise().done(function () {
    getPhoto();
    getQuote();
    $('#spinner').removeClass('hide');
    $('.poster').addClass('hide');
  });
}
