import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { IngredientService } from './ingredient.service';
import { IngredientsDto } from './dto/ingredients.dto';
import { Auth } from 'src/user/auth/decorators/auth.decorator';
import { EnumAuthType } from 'src/user/auth/enums/auth-type.enum';
import { EnumRole } from '@prisma/client';
import { Roles } from 'src/user/authorization/decorators/roles.decorator';
import { IngredientFilterDto } from './dto/ingredient-filter.dto';
import { UpdateIngredientDto } from './dto/update-ingredient.dto';

@Controller('ingredient')
export class IngredientController {
  constructor(private readonly ingredientService: IngredientService) {}

  @Auth(EnumAuthType.None)
  @Get('all')
  getIngredients(@Query() { ingredientGroup }: IngredientFilterDto) {
    return this.ingredientService.getIngredients(ingredientGroup);
  }

  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Post('add')
  addIngredients(@Body() ingredient: IngredientsDto) {
    return this.ingredientService.addIngredients(ingredient);
  }

  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Delete('/:ingredientName')
  deleteIngredient(@Param('ingredientName') ingredientName: string) {
    return this.ingredientService.deleteIngredient(ingredientName);
  }

  @Roles(EnumRole.ADMIN, EnumRole.MANAGER)
  @Patch('/:ingredientId')
  updateIngredient(
    @Param('ingredientName') ingredientId: number,
    @Body() { newIngredientName }: UpdateIngredientDto,
  ) {
    return this.ingredientService.updateIngredient(
      ingredientId,
      newIngredientName,
    );
  }
}
