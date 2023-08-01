import { NextFunction, Request, Response } from "express";
import { MqttSingleton } from "../services/MqttSingleton";
import { Controller } from "./Controller";

export class ActionController extends Controller {
  private mqttSingleton: MqttSingleton;
  constructor() {
    super();
    this.mqttSingleton = MqttSingleton.getInstance();
  }

  openValve = async (req: Request, res: Response, next: NextFunction) => {
    const { id, flow } = req.params;

    try {
      const { data } = await this.supabase.from('devices')
        .select()
        .eq('id', id)
        .limit(1)
        .single();

      if (!data) throw new Error('device not found for open valve');

      this.mqttSingleton.mqttClient.sendMessage(`${id}/valve/${flow}`, '');

      return res.status(200).json({
        status: true,
        message: 'open valve command sent successfully by mqtt',
        results: data.id,
      })
    } catch (error) {
      next(error);
    }
  }
}