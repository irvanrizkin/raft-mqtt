import { NextFunction, Request, Response } from "express";
import { Controller } from "./Controller";
import { sub } from "date-fns";

export class MeasurementController extends Controller {
  constructor() {
    super();
  }

  listByPeriod = async (req: Request, res: Response, next: NextFunction) => {
    const { id } = req.params;

    try {
      const { data, error } = await this.listLatest30Min(id);

      if (error) throw new Error(error.message);

      return res.status(200).json({
        status: true,
        message: 'measurement for last 30 minute listed successfully',
        results: data,
      });
    } catch (error) {
      next(error);
    }
  }

  private listLatest30Min = async (deviceId: string) => {
    return await this.supabase.from('measurements')
      .select()
      .eq('deviceId', deviceId)
      .gte('createdAt', sub(new Date(), { minutes: 30 }).toISOString())
      .order('createdAt');
  }
}
