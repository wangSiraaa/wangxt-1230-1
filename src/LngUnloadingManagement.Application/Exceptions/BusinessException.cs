namespace LngUnloadingManagement.Application.Exceptions;

public class BusinessException : Exception
{
    public int ErrorCode { get; }

    public BusinessException(string message, int errorCode = 400) : base(message)
    {
        ErrorCode = errorCode;
    }

    public BusinessException(string message, Exception innerException, int errorCode = 400)
        : base(message, innerException)
    {
        ErrorCode = errorCode;
    }
}

public class ValidationException : BusinessException
{
    public ValidationException(string message) : base(message, 400) { }
}

public class NotFoundException : BusinessException
{
    public NotFoundException(string message) : base(message, 404) { }
}

public class BusinessConflictException : BusinessException
{
    public BusinessConflictException(string message) : base(message, 409) { }
}
