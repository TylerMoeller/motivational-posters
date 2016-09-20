$(document).ready(function () {
  getPoster();
  $('#reload').click(function () {
    if (!$('#reload').hasClass('disabled')) getPoster();
  });
});

function getPhoto() {
  return $.Deferred(function () {
    var _this = this;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = 'https://source.unsplash.com/category/nature/1280x800?sig=' +
              (Math.random() * 10000).toFixed(0); // random number at end prevents caching

    // Mobile browsers hit CORS issues with this code. Use a proxy as a temp workaround
    if (typeof window.orientation !== 'undefined') img.src = 'https://crossorigin.me/' + img.src;

    // ColorThief library uses <canvas> to get the primary color of the image
    // brightness formula determines if text will be bright enough on the black background
    $(img).load(function () {
      var rgb = new ColorThief().getColor(img, 8),
          borderColor = 'rgb(' + rgb + ')',
          textColor = borderColor,
          brightness = Math.sqrt((0.299 * Math.pow(rgb[0], 2)) +
                                 (0.587 * Math.pow(rgb[1], 2)) +
                                 (0.114 * Math.pow(rgb[2], 2)));

      if (brightness < 50) textColor = '#bdbdbd';
      $('#poster-image, #underline').css('border-color', textColor);
      $('#poster-title').css('color', textColor);
      $('#poster-image').css('background-image', 'url(' + img.src + ')');
      _this.resolve();
    });
  });
}

// Get a quote from the Forismatic API
function getQuote() {
  return $.Deferred(function () {
    var _this = this,
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

    // Forismatic doesn't support HTTPS, use a proxy when needed. (hack...)
    var url = 'http://api.forismatic.com/api/1.0/?method=getQuote&format=jsonp&lang=en&jsonp=?';
    if (window.location.protocol !== 'http:') url = 'https://crossorigin.me/' + url;

    // Call the Forismatic API to get a random quote.
    $.getJSON(url).done(function (data) {
      var quoteText = data.quoteText.trim(),
          quoteAuthor = data.quoteAuthor.trim() || 'Anonymous';

      $('#poster-title').html(titles[Math.floor(Math.random() * titles.length)]);
      $('#poster-text').html('"' + quoteText + '"<br>~ ' + quoteAuthor);
    }).fail(function (err) {
      alert('Error, please try again. Error Message: ', err);
    }).always(function () {
      _this.resolve();
    });
  });
}

// Disable the reload button and display a spinner while retrieving the new poster
// Fade out the poster, get a new one, and fade the new poster back in
function getPoster() {
  $('#reload').addClass('disabled');
  $('#poster').fadeOut(1000).promise().done(function () {
    $('#poster').addClass('hide');
    $('#spinner').removeClass('hide');
    $.when(getPhoto(), getQuote()).then(function () {
      $('#spinner').addClass('hide');
      $('#poster').fadeIn(1500).removeClass('hide');
      $('#reload').removeClass('disabled');
    });
  });
}
