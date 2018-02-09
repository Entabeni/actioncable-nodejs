class Subscription {
  constructor(name, cable, callbacks) {
    this.name = name;
    this.callbacks = callbacks;
    this.cable = cable;

    this.cable.connection_promise.then((con) => {
      console.log(`ActionCable - connecting to ${name}`);

      con.send(JSON.stringify({
        command: 'subscribe',
        identifier: JSON.stringify({channel: name})
      }));
    });
  }

  handle_message(type, data) {
    if(type) {
      switch(type) {
        case 'confirm_subscription':
          this.callbacks.connected();
          break;
        case 'reject_subscription':
          this.callbacks.rejected();
          break;
        default:
          console.log(`Subscription(${this.name}) - Unhandled message type ${type} | ${data}`);
          break;
      }
    } else {
      this.callbacks.received(data);
    }
  }

  perform(action, data) {
    data = data || {};
    data.action = action;

    this.send(data);
  }

  send(data) {
    this.cable.connection_promise.then((con) => {
      con.send(this._create_packet(data));
    });
  }

  _create_packet(data) {
    let packet = {
      identifier: JSON.stringify({ channel: this.name }),
      command: "message",
      data: JSON.stringify(data)
    };

    return JSON.stringify(packet);
  }
};

module.exports = Subscription;
