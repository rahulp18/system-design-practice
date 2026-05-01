import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common';
import { UpdateUserDTO } from './dto/update-user.dto';
import { UserService } from './user.service';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  async getAllUsers(
    @Query('page', ParseIntPipe) page: number,
    @Query('limit', ParseIntPipe) limit: number,
  ) {
    console.log({ page, limit });
    return this.userService.getAllUsers(page, limit);
  }

  @Get(':id')
  async getUserById(@Param('id') id: string) {
    return this.userService.getUserById(id);
  }
  @Patch(':id')
  async updateUser(
    @Param('id') id: string,
    @Body() updateUserDTO: UpdateUserDTO,
  ) {
    return this.userService.updateUser(id, updateUserDTO);
  }
  @Delete(':id')
  async deleteUser(@Param('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
