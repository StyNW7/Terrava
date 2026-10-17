import { Body, Controller, Delete, Get, Module, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CurrentUser, RequirePermissions } from '../../common/decorators';
import { Permission } from '../../common/permissions';
import type { AuthContext } from '../../common/auth-context';
import { TeamService } from './team.service';
import { InviteMemberDto, UpdateMemberDto } from './team.dto';

@ApiTags('Team & Staff')
@ApiBearerAuth()
@Controller('team')
class TeamController {
  constructor(private readonly team: TeamService) {}

  @Get()
  @ApiQuery({ name: 'farmId', required: false })
  list(@CurrentUser() user: AuthContext, @Query('farmId') farmId?: string) {
    return this.team.list(user, farmId);
  }

  @Get('permissions')
  @ApiOperation({ summary: 'Role x permission matrix (the source of truth for the guards)' })
  permissions() {
    return this.team.permissionsMatrix();
  }

  @Get('invitations')
  @RequirePermissions(Permission.MANAGE_TEAM)
  invitations(@CurrentUser() user: AuthContext) {
    return this.team.pendingInvitations(user);
  }

  @Post('invitations')
  @RequirePermissions(Permission.MANAGE_TEAM)
  @ApiOperation({ summary: 'Invite a member by email' })
  invite(@CurrentUser() user: AuthContext, @Body() dto: InviteMemberDto) {
    return this.team.invite(user, dto);
  }

  @Post('invitations/:id/resend')
  @RequirePermissions(Permission.MANAGE_TEAM)
  resend(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.team.resendInvitation(user, id);
  }

  @Delete('invitations/:id')
  @RequirePermissions(Permission.MANAGE_TEAM)
  revoke(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.team.revokeInvitation(user, id);
  }

  @Get(':id')
  get(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.team.get(user, id);
  }

  @Patch(':id')
  @RequirePermissions(Permission.MANAGE_TEAM)
  @ApiOperation({ summary: 'Change role, farm assignment or title' })
  update(@CurrentUser() user: AuthContext, @Param('id') id: string, @Body() dto: UpdateMemberDto) {
    return this.team.update(user, id, dto);
  }

  @Post(':id/deactivate')
  @RequirePermissions(Permission.MANAGE_TEAM)
  deactivate(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.team.setActive(user, id, false);
  }

  @Post(':id/activate')
  @RequirePermissions(Permission.MANAGE_TEAM)
  activate(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.team.setActive(user, id, true);
  }

  @Delete(':id')
  @RequirePermissions(Permission.MANAGE_TEAM)
  remove(@CurrentUser() user: AuthContext, @Param('id') id: string) {
    return this.team.remove(user, id);
  }
}

@Module({
  controllers: [TeamController],
  providers: [TeamService],
  exports: [TeamService],
})
export class TeamModule {}
