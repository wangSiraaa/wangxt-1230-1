using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LngUnloadingManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ShutdownEventsController : ControllerBase
{
    private readonly IShutdownEventService _service;

    public ShutdownEventsController(IShutdownEventService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ShutdownEventDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ShutdownEventDto>> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("berthPlan/{berthPlanId:guid}")]
    public async Task<ActionResult<IEnumerable<ShutdownEventDto>>> GetByBerthPlanId(Guid berthPlanId)
    {
        var result = await _service.GetByBerthPlanIdAsync(berthPlanId);
        return Ok(result);
    }

    [HttpGet("status/{status}")]
    public async Task<ActionResult<IEnumerable<ShutdownEventDto>>> GetByStatus(int status)
    {
        var result = await _service.GetByStatusAsync(status);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<ShutdownEventDto>> Create([FromBody] CreateShutdownEventDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.CreateAsync(dto, operatorName);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<ShutdownEventDto>> Update(Guid id, [FromBody] UpdateShutdownEventDto dto)
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

    [HttpPost("{id:guid}/record-recovery")]
    public async Task<ActionResult<ShutdownEventDto>> RecordRecoveryCondition(Guid id, [FromBody] RecordRecoveryConditionDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.RecordRecoveryConditionAsync(id, dto, operatorName);
        return Ok(result);
    }

    [HttpPost("{id:guid}/resume")]
    public async Task<ActionResult<ShutdownEventDto>> Resume(Guid id)
    {
        var operatorName = GetOperatorName();
        var result = await _service.ResumeAsync(id, operatorName);
        return Ok(result);
    }

    [HttpPost("{id:guid}/close")]
    public async Task<ActionResult<ShutdownEventDto>> Close(Guid id)
    {
        var operatorName = GetOperatorName();
        var result = await _service.CloseAsync(id, operatorName);
        return Ok(result);
    }

    private string GetOperatorName()
    {
        return Request.Headers["X-Operator"].FirstOrDefault() ?? "System";
    }
}
