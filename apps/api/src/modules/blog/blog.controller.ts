import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  ForbiddenException,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation } from '@nestjs/swagger';
import { BlogService } from './blog.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('blog')
@Controller({ path: 'blog', version: '1' })
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  // ── Public ──────────────────────────────────────────────────────────────────

  @Get()
  @ApiOperation({ summary: 'List published posts (public)' })
  findAll(@Query('admin') admin?: string) {
    // admin=true is validated by JWT guard below; here just returns published
    return this.blogService.findAll(false);
  }

  @Get('recent')
  @ApiOperation({ summary: 'Get 4 most recent published posts' })
  findRecent() {
    return this.blogService.findRecent(4);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get post by slug (public)' })
  findBySlug(@Param('slug') slug: string) {
    return this.blogService.findBySlug(slug);
  }

  // ── Admin (JWT required) ──────────────────────────────────────────────────

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'List all posts including drafts (admin)' })
  findAllAdmin(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.findAll(false);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  findById(@Param('id') id: string) {
    return this.blogService.findById(id);
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Create post (admin)' })
  create(@Request() req: any, @Body() dto: CreatePostDto) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.create(req.user.id, dto);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @ApiOperation({ summary: 'Update post (admin)' })
  update(@Request() req: any, @Param('id') id: string, @Body() dto: UpdatePostDto) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete post (admin)' })
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.remove(id);
  }

  // ── Gemini AI ─────────────────────────────────────────────────────────────

  @Post('ai/generate-text')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate post text with Gemini (admin)' })
  generateText(@Request() req: any, @Body() body: { headline: string; seedContent?: string }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.generateText(body.headline, body.seedContent);
  }

  @Post('ai/generate-linkedin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate LinkedIn post from blog content (admin)' })
  generateLinkedIn(@Request() req: any, @Body() body: { headline: string; content: string }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.generateLinkedInPost(body.headline, body.content);
  }

  @Post('ai/generate-image')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('jwt')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Generate cover image with Gemini (admin)' })
  generateImage(@Request() req: any, @Body() body: { headline: string }) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.blogService.generateImage(body.headline);
  }
}
