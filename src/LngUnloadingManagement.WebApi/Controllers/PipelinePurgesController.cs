using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LngUnloadingManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PipelinePurgesController : ControllerBase
{
    private readonly IPipelinePurgeService _service;

    public PipelinePurgesController(IPipelinePurgeService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PipelinePurgeDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PipelinePurgeDto>> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("berthPlan/{berthPlanId:guid}")]
    public async Task<ActionResult<IEnumerable<PipelinePurgeDto>>> GetByBerthPlanId(Guid berthPlanId)
    {
        var result = await _service.GetByBerthPlanIdAsync(berthPlanId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<PipelinePurgeDto>> Create([FromBody] CreatePipelinePurgeDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.CreateAsync(dto, operatorName);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<PipelinePurgeDto>> Update(Guid id, [FromBody] UpdatePipelinePurgeDto dto)
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

    [HttpPost("{id:guid}/confirm-oxygen")]
    public async Task<ActionResult<PipelinePurgeDto>> ConfirmOxygenContent(Guid id, [FromBody] ConfirmPurgeDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.ConfirmOxygenContentAsync(id, dto, operatorName);
        return Ok(result);
    }

    [HttpPost("{id:guid}/engineer-confirm")]
    public async Task<ActionResult<PipelinePurgeDto>> EngineerConfirm(Guid id)
    {
        var engineerName = GetOperatorName();
        var result = await _service.EngineerConfirmAsync(id, engineerName);
        return Ok(result);
    }

    [HttpGet("berthPlan/{berthPlanId:guid}/can-unload")]
    public async Task<ActionResult<bool>> CanStartUnloading(Guid berthPlanId)
    {
        var result = await _service.CanStartUnloadingAsync(berthPlanId);
        return Ok(result);
    }

    private string GetOperatorName()
    {
        return Request.Headers["X-Operator"].FirstOrDefault() ?? "System";
    }
}
