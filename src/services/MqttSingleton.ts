import { MqttService } from "./MqttService";
import { SupabaseSingleton } from "./SupabaseSingleton";

export class MqttSingleton {
  private static instance: MqttSingleton;
  mqttClient: MqttService;
  private supabase = SupabaseSingleton.getInstance().supabase;

  private count = 0;

  private constructor(host: string = "") {
    this.mqttClient = new MqttService(host);
    this.mqttClient.setOnMessage(this.addMeasurement);
    this.subscribeAll();
  }

  private addMeasurement = async (topic: string, message: Buffer) => {
    try {
      if (topic.includes('/read')) {
        console.log(this.count);
      }

      this.count++;

      if (topic.includes('/reset')) {
        console.log('reset');
        this.count = 0;
      }

      if (topic.includes('/tdstemp')) {
        const { ppm, temperature, source } = JSON.parse(message.toString());
        const [deviceId] = topic.split('/');

        // await this.supabase.from('measurements')
        //   .insert({
        //     ppm: Math.round(ppm),
        //     temperature,
        //     deviceId,
        //     source,
        //   });
      }
    } catch (error) {
      console.log(error);
    }
  }

  subscribeAll = async () => {
    try {
      const { data } = await this.supabase.from('devices').select();
      data?.map((device) => {
        this.mqttClient.addSubscriber(`${device.id}/+`);
      })
      this.mqttClient.addSubscriber(`internal/mqtt-stresser/+`);
      console.log('resubscribe event occured');
    } catch (error) {
      console.log(error);
    }
  }

  public static getInstance() {
    if (!MqttSingleton.instance) {
      MqttSingleton.instance = new MqttSingleton(process.env.MQTT_HOST);
    }
    return MqttSingleton.instance;
  }
}
