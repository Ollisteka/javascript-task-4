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
        this.counter = 0;
        this.times = times && times > 0 ? times : Infinity;
        this.frequency = frequency && frequency > 0 ? frequency : 1;
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

    function getSubscribers(event, filterFunc) {
        return events.get(event)
            .filter(filterFunc);
    }

    function addSubscriber(eventName, subscriberParams) {
        const {
            context,
            handler,
            times,
            frequency
        } = subscriberParams;
        if (!events.has(eventName)) {
            events.set(eventName, []);
        }

        events.get(eventName).push(new Subscriber(context, handler, times, frequency));

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
            addSubscriber(event, {
                context: context,
                handler: handler
            });

            return this;
        },

        /**
         * Отписаться от события
         * @param {String} event
         * @param {Object} context
         * @returns {Object}
         */
        off: function (event, context) {
            Array.from(events.keys())
                .filter(eventName => eventName === event || eventName.startsWith(event + '.'))
                .forEach(innerEvent =>
                    events.set(innerEvent,
                        getSubscribers(innerEvent, subscriber => subscriber.context !== context)));

            return this;
        },

        /**
         * Уведомить о событии
         * @param {String} event
         * @returns {Object}
         */
        emit: function (event) {
            getEventsList(event).forEach(innerEvent => {
                if (!events.has(innerEvent)) {
                    return this;
                }

                events.get(innerEvent).forEach(subscriber => {
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
            addSubscriber(event, {
                context: context,
                handler: handler,
                times: times
            });

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
            addSubscriber(event, {
                context: context,
                handler: handler,
                frequency: frequency
            });

            return this;
        }
    };
}

module.exports = {
    getEmitter,

    isStar
};
