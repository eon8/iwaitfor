var timeout = window.setTimeout(
    function () {
        window.location.reload();
    },
    10000
);
var listener = function () {
    clearInterval(timeout);
    console.log('stopped');
    document.removeEventListener('click', listener);
};
document.addEventListener('click', listener);
