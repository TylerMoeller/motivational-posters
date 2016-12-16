/* jshint esversion: 6 */

$(document).ready(() => {
  $.ajaxSetup({ timeout: 4000 });
  getPoster();
  $('#poster').hide().removeClass('hide');
  $('#reload').on('click', () => {
    if (!$('#reload').hasClass('disabled')) getPoster();
  });
});

function getPhoto() {
  return $.Deferred(promise => {
    const _this = promise;

    // random number at the end of the url prevents caching
    const randomNum = Math.floor(Math.random() * 1e6),
          url = 'https://source.unsplash.com/category/nature/1280x800?sig=' + randomNum,
          img = new Image();

    img.crossOrigin = 'anonymous';
    img.src = url;

    // Mobile browsers hit CORS issues. Use a proxy as a (temporary) workaround...
    if (typeof window.orientation !== 'undefined')
      img.src = 'https://cors-anywhere.herokuapp.com/' + img.src;

    // ColorThief library uses <canvas> to get the primary color of the image
    // brightness formula determines if text will be bright enough on the black background
    $(img).load(() => {
      var rgb = new ColorThief().getColor(img, 8),
          borderColor = 'rgb(' + rgb + ')',
          textColor = borderColor,
          brightness = Math.sqrt((0.299 * Math.pow(rgb[0], 2)) +
                                 (0.587 * Math.pow(rgb[1], 2)) +
                                 (0.114 * Math.pow(rgb[2], 2)));

      if (brightness < 50) textColor = '#ddd';

      $('#poster-image').css('background-image', 'url(' + url + ')');
      $('#poster-image, #underline').css('border-color', textColor);
      $('#poster-title').css('color', textColor);

      _this.resolve();
    });
  });
}

// Get a quote from the Forismatic API
function getQuote() {
  return $.Deferred(promise => {
    const _this = promise;

    // Choose a random (cheesy) title for the post
    const titles = [
                    'INTEGRITY',
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

    $('#poster-title').html(titles[Math.floor(Math.random() * titles.length)]);

    // Get a random date between 2010 and now to request that date's quote of the day from Wikiquote
    const randomDate = new Date(new Date(2010, 0, 1).getTime() +
                               Math.random() *
                               (new Date().getTime() - new Date(2010, 0, 1).getTime())),
          dateFormat = { month: 'long', day: 'numeric', year: 'numeric' },
          quoteDate = randomDate.toLocaleString('en-us', dateFormat)
                                .replace(/\s/g, '_'),
          url = 'https://en.wikiquote.org/w/api.php?action=parse' +
                '&format=json' +
                '&page=Wikiquote%3AQuote_of_the_day%2F' + quoteDate +
                '&callback=?';

    // Call the WikiQuote API and write the quote to the page
    // Try again if the quote is excessively long or undefined
    $.getJSON(url).done(data => {
      const quote = $(data.parse.text['*']).text().split('~');
      if (!quote[1] || quote.toString().length > 300) getQuote();
      $('#poster-text').html(quote[0].trim() + '<br>~' + quote[1]);
    }).fail(err => {
      $('body').css('font-family: verdana');
      $('#poster-title').html('Error: ' + err.statusText);
      $('#poster-text').html('Please try again later.');
    }).always(() => {
      _this.resolve();
    });
  });
}

// Disable the reload button and display a spinner while retrieving the new poster
// Fade out the poster, get a new one, and fade the new poster back in
function getPoster() {
  $('#spinner').hide();
  $('#reload').addClass('disabled');
  $('#poster').fadeOut(700).promise().done(() => {
    $('#spinner').removeClass('hide').show();
    $.when(getPhoto(), getQuote()).then(() => {
      $('#spinner').hide();
      $('#poster').fadeIn(1500);
      $('#reload').removeClass('disabled');
    });
  });
}
