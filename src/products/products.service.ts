import { ConflictException, Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { Prisma } from 'generated/prisma';

@Injectable()
export class ProductsService {

  constructor(private prismaService: PrismaService) { }

  async create(createProductDto: CreateProductDto) {
    try {
      return await this.prismaService.product.create({
        data: createProductDto
      })
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ConflictException(`Product with name ${createProductDto.name} already exists`)
        }
      }
      throw new InternalServerErrorException();
    }
  }

  findAll() {
    return this.prismaService.product.findMany();
  }

  async findOne(id: number | string) {
    try {
      // Convertir id a número
      const numericId = typeof id === 'string' ? parseInt(id, 10) : id;
      
      // Validar que sea un número válido
      if (isNaN(numericId)) {
        throw new NotFoundException(`ID de producto inválido: ${id}`);
      }
      
      const productFound = await this.prismaService.product.findUnique({
        where: { id: numericId }
      });
    
      if (!productFound) {
        throw new NotFoundException(`Producto con id ${id} no encontrado`);
      }
    
      return productFound;
    } catch (error) {
      // Manejar errores específicos
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Error al buscar el producto');
    }
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const updatedProduct = await this.prismaService.product.update({
      where: {
        id: id
      },
      data: updateProductDto
    })
    if (!updatedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`)
    }
    return updatedProduct;
  }

  async remove(id: number) {
    const deletedProduct = await this.prismaService.product.delete({
      where: {
        id: id
      }
    })

    if (!deletedProduct) {
      throw new NotFoundException(`Product with id ${id} not found`)
    }
    return deletedProduct;

  }
}
