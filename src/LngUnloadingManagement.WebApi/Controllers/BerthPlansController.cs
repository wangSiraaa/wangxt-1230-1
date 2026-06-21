using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LngUnloadingManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BerthPlansController : ControllerBase
{
    private readonly IBerthPlanService _service;

    public BerthPlansController(IBerthPlanService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BerthPlanDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<BerthPlanDto>> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("{id:guid}/detail")]
    public async Task<ActionResult<BerthPlanDetailDto>> GetDetailById(Guid id)
    {
        var result = await _service.GetDetailByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("planNo/{planNo}")]
    public async Task<ActionResult<BerthPlanDto>> GetByPlanNo(string planNo)
    {
        var result = await _service.GetByPlanNoAsync(planNo);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<BerthPlanDto>>> GetByStatus(int status)
    {
        var result = await _service.GetByStatusAsync(status);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<BerthPlanDto>> Create([FromBody] CreateBerthPlanDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.CreateAsync(dto, operatorName);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<BerthPlanDto>> Update(Guid id, [FromBody] UpdateBerthPlanDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.UpdateAsync(id, dto, operatorName);
        return Ok(result);
    }

    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> Delete(Guid id)
    {
        var success = await _service.DeleteAsync(id);
        if (!success) return NotFound();
        return NoContent();
    }

    [HttpPost("{id:guid}/start-unloading")]
    public async Task<ActionResult<BerthPlanDto>> StartUnloading(Guid id)
    {
        var operatorName = GetOperatorName();
        var result = await _service.StartUnloadingAsync(id, operatorName);
        return Ok(result);
    }

    [HttpPost("{id:guid}/complete-unloading")]
    public async Task<ActionResult<BerthPlanDto>> CompleteUnloading(Guid id)
    {
        var operatorName = GetOperatorName();
        var result = await _service.CompleteUnloadingAsync(id, operatorName);
        return Ok(result);
    }

    private string GetOperatorName()
    {
        return Request.Headers["X-Operator"].FirstOrDefault() ?? "System";
    }
}
