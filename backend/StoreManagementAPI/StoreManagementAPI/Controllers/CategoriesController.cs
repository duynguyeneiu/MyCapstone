using CatalogService.API.Common.Paging;
using CatalogService.API.DTOs.Category;
using CatalogService.API.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using StoreManagementAPI.Data;
using StoreManagementAPI.Models;

[Route("api/[controller]")]
[ApiController]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }


    [HttpGet]
    public async Task<IActionResult> GetAll([FromQuery] PagingRequest request)
    {
        var result = await _categoryService.GetPagedAsync(
            request.Page,
            request.PageSize,
            request.Keyword);

        return Ok(result);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        return Ok(await _categoryService.GetByIdAsync(id));
    }


    [HttpPost]
    public async Task<IActionResult> Create(CreateCategoryDto dto)
    {
        var category = await _categoryService.CreateAsync(dto);

        return CreatedAtAction(
            nameof(GetById),
            new { id = category.CategoryId },
            category);
    }


    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(
    int id,
    UpdateCategoryDto dto)
    {
        await _categoryService.UpdateAsync(id, dto);

        return NoContent();
    }


    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await _categoryService.DeleteAsync(id);

        return NoContent();
    }



}
