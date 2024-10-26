import { Controller, Get, Put, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { CheckService } from './check.service';
import { Meeting } from '../tinquiry/schemas/meeting.schema';

@ApiTags('교사')
@Controller('teacher')
export class CheckController {
  constructor(private readonly checkService: CheckService) {}

  @Put('/:meetingId')
  @ApiOperation({ summary: '회의록 확인' })
  async confirmMeeting(@Param('meetingId') meetingId: string): Promise<{ meeting: Meeting; token: string }> {
    return this.checkService.confirmMeetingById(meetingId);
  }
}
