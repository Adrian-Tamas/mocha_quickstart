const dateformat = require("dateformat");

module.exports = function Reservation_payload({book_id,
                                               user_id,
                                               reservation_date = dateformat(Date.now(), "shortDate"),
                                               reservation_expiration_date = null} = {}) {
    let reservation = {};
    reservation.book_id = book_id;
    reservation.user_id = user_id;
    reservation.reservation_date = reservation_date;
    reservation.reservation_expiration_date = reservation_expiration_date;

    return reservation;
};