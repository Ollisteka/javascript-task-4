'use strict';

/**
 * Сделано задание на звездочку
 * Реализованы методы several и through
 */
const isStar = true;

class Subscriber {
    constructor(context, handler, times, frequency) {
        this.context = context;
        this.handler = handler;
        this.times = Infinity;
        this.counter = 0;
        this.frequency = 1;
        if (times && times > 0) {
            this.times = times;
        }

        if (frequency && frequency > 0) {
            this.frequency = frequency;
        }
    }

    call() {
        this.handler.apply(this.context);
        this.times--;
    }

    eligibleForCall() {
        return this.times > 0 && this.counter % this.frequency === 0;
    }
}

/**
 * Для строки вида a.b.c вернёт список из a.b.c, a.b, a
 * @param {String} eventName
 * @returns {[String]}
 */
function getEventsList(eventName) {
    let result = [];
    let rightmostDotIndex = eventName.length;
    while (rightmostDotIndex !== -1) {
        result.push(eventName.substring(0, rightmostDotIndex));
        rightmostDotIndex = eventName.lastIndexOf('.', rightmostDotIndex - 1);
    }

    return result;
}

/**
 * Возвращает новый emitter
 * @returns {Object}
 */
function getEmitter() {
    let events = new Map();

    function getFilteredSubscribers(event, context) {
        return events.get(event)
            .filter(subscriber => subscriber.context !== context);
    }

    // eslint-disable-next-line max-params
    function addSubscriber(event, context, handler, times, frequency) {
        if (!events.has(event)) {
            events.set(event, []);
        }

        events.get(event).push(new Subscriber(context, handler, times, frequency));

    }

    return {

        /**
         * Подписаться на событие
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @returns {Object}
         */
        on: function (event, context, handler) {
            console.info(event, context, handler);
            addSubscriber(event, context, handler);

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            console.info(event, context);

            if (!event.includes('.')) {
                Array.from(events.keys())
                    .filter(str => str.startsWith(event))
                    .forEach(e => events.set(e, getFilteredSubscribers(e, context)));
            } else if (events.has(event)) {
                events.set(event, getFilteredSubscribers(event, context));
            }

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            console.info(event);
            getEventsList(event).forEach(e => {
                if (!events.has(e)) {
                    return this;
                }

                events.get(e).forEach(subscriber => {
                    if (subscriber.eligibleForCall()) {
                        subscriber.call();
                    }
                    subscriber.counter++;
                });
            });

            return this;
        },

        /**
         * Подписаться на событие с ограничением по количеству полученных уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} times – сколько раз получить уведомление
         * @returns {Object}
         */
        several: function (event, context, handler, times) {
            console.info(event, context, handler, times);
            addSubscriber(event, context, handler, times);

            return this;
        },

        /**
         * Подписаться на событие с ограничением по частоте получения уведомлений
         * @star
         * @param {String} event
         * @param {Object} context
         * @param {Function} handler
         * @param {Number} frequency – как часто уведомлять
         * @returns {Object}
         */
        through: function (event, context, handler, frequency) {
            console.info(event, context, handler, frequency);
            addSubscriber(event, context, handler, undefined, frequency);

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
