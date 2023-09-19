import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { IngredientsDto } from './dto/ingredients-dto';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { EnumRole } from '@prisma/client';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';

@Controller('ingredient')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Auth(EnumAuthType.None)
  @Get('all')
  getIngredients() {
    return this.ingredientService.getIngredients();
  }

  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Post('add')
  addIngredients(@Body() ingredient: IngredientsDto) {
    return this.ingredientService.addIngredients(ingredient);
  }

  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Delete('/:ingredientName')
  deleteIngredient(@Param('ingredientName') ingredientName: string) {
    console.log(ingredientName);
    return this.ingredientService.deleteIngredient(ingredientName);
  }
}
