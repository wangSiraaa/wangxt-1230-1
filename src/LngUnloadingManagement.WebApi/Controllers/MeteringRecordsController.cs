using LngUnloadingManagement.Application.DTOs;
using LngUnloadingManagement.Application.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace LngUnloadingManagement.WebApi.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MeteringRecordsController : ControllerBase
{
    private readonly IMeteringRecordService _service;

    public MeteringRecordsController(IMeteringRecordService service)
    {
        _service = service;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MeteringRecordDto>>> GetAll()
    {
        var result = await _service.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<MeteringRecordDto>> GetById(Guid id)
    {
        var result = await _service.GetByIdAsync(id);
        if (result == null) return NotFound();
        return Ok(result);
    }

    [HttpGet("berthPlan/{berthPlanId:guid}")]
    public async Task<ActionResult<IEnumerable<MeteringRecordDto>>> GetByBerthPlanId(Guid berthPlanId)
    {
        var result = await _service.GetByBerthPlanIdAsync(berthPlanId);
        return Ok(result);
    }

    [HttpPost]
    public async Task<ActionResult<MeteringRecordDto>> Create([FromBody] CreateMeteringRecordDto dto)
    {
        var operatorName = GetOperatorName();
        var result = await _service.CreateAsync(dto, operatorName);
        return CreatedAtAction(nameof(GetById), new { id = result.Id }, result);
    }

    [HttpPut("{id:guid}")]
    public async Task<ActionResult<MeteringRecordDto>> Update(Guid id, [FromBody] UpdateMeteringRecordDto dto)
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

    [HttpPost("{id:guid}/submit")]
    public async Task<ActionResult<MeteringRecordDto>> Submit(Guid id)
    {
        var operatorName = GetOperatorName();
        var result = await _service.SubmitAsync(id, operatorName);
        return Ok(result);
    }

    [HttpPost("{id:guid}/review")]
    public async Task<ActionResult<MeteringRecordDto>> Review(Guid id, [FromBody] ReviewMeteringDto dto)
    {
        var result = await _service.ReviewAsync(id, dto);
        return Ok(result);
    }

    private string GetOperatorName()
    {
        return Request.Headers["X-Operator"].FirstOrDefault() ?? "System";
    }
}
