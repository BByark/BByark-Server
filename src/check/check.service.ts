import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { Teacher } from '../tinquiry/schemas/teacher.schema';
import { Meeting } from '../tinquiry/schemas/meeting.schema';

config();

@Injectable()
export class CheckService {
  constructor(
    @InjectModel(Teacher.name) private teacherModel: Model<Teacher>,
    @InjectModel(Meeting.name) private meetingModel: Model<Meeting>,
  ) {}

  async getTeacherById(id: string): Promise<{ teacher: Teacher; meetings: Meeting[] | string }> {
    const teacher = await this.teacherModel.findOne({ username: id }).exec();
    if (!teacher) {
      throw new NotFoundException('등록되지 않은 교사입니다.');
    }

    const meetings = await this.meetingModel.find({ class: teacher.class }).exec();
    
    if (meetings.length === 0) {
      return { teacher, meetings: "회의가 없습니다." };
    }
    const filteredMeetings = meetings.filter(meeting => 
      meeting.title || meeting.topic_id 
    );

    return { teacher, meetings: filteredMeetings };
  }

  async confirmMeetingById(meetingId: string): Promise<{ meeting: Meeting; token: string }> {
    const meeting = await this.meetingModel.findById(meetingId).exec();
    if (!meeting) {
      throw new NotFoundException(`회의록 ID ${meetingId}가 존재하지 않습니다.`);
    }

    try {
      const token = this.signMeetingData({ meetingId, title: meeting.title, topic_id: meeting.topic_id });

      meeting.confirmed = true;
      await meeting.save();

      return { meeting, token }; 
    } catch (error) {
      console.error('회의록 확인 중 오류 발생:', error);
      throw new InternalServerErrorException('회의록 확인 중 오류가 발생했습니다.');
    }
  }

  private signMeetingData(meetingData: any): string {
    return jwt.sign(meetingData, process.env.JWT_SECRET, { expiresIn: '1h' }); 
  }
  public verifyMeetingData(token: string): boolean {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return true;
    } catch (error) {
      console.error('JWT 검증 실패:', error);
      return false;
    }
  }
}
