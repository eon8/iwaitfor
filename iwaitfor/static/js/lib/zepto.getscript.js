;(function ($) {
    $.extend($, {
        getScript: function (src, onload) {
            var script = document.createElement('script');
            script.async = true;
            script.src = src;
            if (onload) {
                script.onload = onload;
            }
            $('head').append(script);
        }
    })
})(Zepto)